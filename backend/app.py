from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import time
import json

from algorithms.huffman import compress_huffman, decompress_huffman, build_huffman_tree, get_tree_json
from algorithms.rle import compress_rle, decompress_rle
from algorithms.lzw import compress_lzw, decompress_lzw
from analysis.analyzer import analyze_file
from security.crypto import encrypt_data, decrypt_data

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    text = file.read().decode('utf-8')
    analysis = analyze_file(text)
    
    # Also return Huffman Tree structure for visualization
    tree = build_huffman_tree(text)
    tree_json, _ = get_tree_json(tree)
    
    return jsonify({
        'analysis': analysis,
        'tree': tree_json
    })

@app.route('/api/compress', methods=['POST'])
def compress():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    algorithm = request.form.get('algorithm', 'huffman')
    password = request.form.get('password', '')
    
    text = file.read().decode('utf-8')
    original_size = len(text.encode('utf-8'))
    
    start_time = time.time()
    
    response_data = {
        'original_size': original_size,
        'algorithm': algorithm,
    }
    
    # --- HUFFMAN ---
    if algorithm == 'huffman':
        b_arr, codes, padding = compress_huffman(text)
        payload = json.dumps({
            'codes': codes,
            'padding': padding,
            'data': list(b_arr) # byte array to list
        }).encode('utf-8')
        
        response_data['execution_time'] = (time.time() - start_time) * 1000
        response_data['compressed_size'] = len(payload)
        
        if password:
            payload = encrypt_data(payload, password).encode('utf-8')
            response_data['is_encrypted'] = True
            response_data['compressed_size'] = len(payload)
            
        return send_file(
            io.BytesIO(payload),
            mimetype='application/octet-stream',
            as_attachment=True,
            download_name=f'compressed.huff'
        )

    # --- RLE ---
    elif algorithm == 'rle':
        b_arr = compress_rle(text)
        payload = b_arr
        
        response_data['execution_time'] = (time.time() - start_time) * 1000
        response_data['compressed_size'] = len(payload)
        
        if password:
            payload = encrypt_data(payload, password).encode('utf-8')
            response_data['is_encrypted'] = True
            response_data['compressed_size'] = len(payload)
            
        return send_file(
            io.BytesIO(payload),
            mimetype='application/octet-stream',
            as_attachment=True,
            download_name=f'compressed.rle'
        )
        
    # --- LZW ---
    elif algorithm == 'lzw':
        compressed_list = compress_lzw(text)
        payload = json.dumps(compressed_list).encode('utf-8')
        
        response_data['execution_time'] = (time.time() - start_time) * 1000
        response_data['compressed_size'] = len(payload)
        
        if password:
            payload = encrypt_data(payload, password).encode('utf-8')
            response_data['is_encrypted'] = True
            response_data['compressed_size'] = len(payload)
            
        return send_file(
            io.BytesIO(payload),
            mimetype='application/octet-stream',
            as_attachment=True,
            download_name=f'compressed.lzw'
        )
        
    return jsonify({'error': 'Invalid algorithm'}), 400


@app.route('/api/decompress', methods=['POST'])
def decompress():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    algorithm = request.form.get('algorithm', 'huffman')
    password = request.form.get('password', '')
    
    payload = file.read()
    
    if password:
        try:
            payload = decrypt_data(payload.decode('utf-8'), password)
        except ValueError as e:
            return jsonify({'error': str(e)}), 401
            
    try:
        if algorithm == 'huffman':
            data = json.loads(payload.decode('utf-8'))
            text = decompress_huffman(data['data'], data['codes'], data['padding'])
        elif algorithm == 'rle':
            text = decompress_rle(payload)
        elif algorithm == 'lzw':
            compressed_list = json.loads(payload.decode('utf-8'))
            text = decompress_lzw(compressed_list)
        else:
            return jsonify({'error': 'Invalid algorithm'}), 400
            
        return send_file(
            io.BytesIO(text.encode('utf-8')),
            mimetype='text/plain',
            as_attachment=True,
            download_name='decompressed.txt'
        )
    except Exception as e:
        return jsonify({'error': f'Failed to decompress: {str(e)}'}), 400


@app.route('/api/compare', methods=['POST'])
def compare():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    text = file.read().decode('utf-8')
    original_size = len(text.encode('utf-8'))
    
    results = []
    
    # Huffman
    start = time.time()
    huff_barr, _, _ = compress_huffman(text)
    huff_time = (time.time() - start) * 1000
    results.append({
        'algorithm': 'Huffman',
        'compressed_size': len(huff_barr), # Not including metadata overhead for pure algo comparison
        'ratio': f"{(original_size / (len(huff_barr) or 1)):.2f}",
        'time_taken': round(huff_time, 2)
    })
    
    # RLE
    start = time.time()
    rle_barr = compress_rle(text)
    rle_time = (time.time() - start) * 1000
    results.append({
        'algorithm': 'RLE',
        'compressed_size': len(rle_barr),
        'ratio': f"{(original_size / (len(rle_barr) or 1)):.2f}",
        'time_taken': round(rle_time, 2)
    })
    
    # LZW
    start = time.time()
    lzw_list = compress_lzw(text)
    # Estimate size in bytes assuming each code uses 2 bytes (16-bit)
    lzw_size = len(lzw_list) * 2
    lzw_time = (time.time() - start) * 1000
    results.append({
        'algorithm': 'LZW',
        'compressed_size': lzw_size,
        'ratio': f"{(original_size / (lzw_size or 1)):.2f}",
        'time_taken': round(lzw_time, 2)
    })
    
    return jsonify({'original_size': original_size, 'comparison': results})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
