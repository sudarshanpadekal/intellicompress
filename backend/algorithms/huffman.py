import heapq
import collections

class HuffmanNode:
    def __init__(self, char, freq):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq

def build_huffman_tree(text):
    if not text:
        return None
    freq = collections.Counter(text)
    heap = [HuffmanNode(char, count) for char, count in freq.items()]
    heapq.heapify(heap)

    if len(heap) == 1:
        node = HuffmanNode(None, 0)
        node.left = heapq.heappop(heap)
        heap.append(node)

    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        merged = HuffmanNode(None, left.freq + right.freq)
        merged.left = left
        merged.right = right
        heapq.heappush(heap, merged)

    return heap[0]

def build_codes(node, prefix="", codebook=None):
    if codebook is None:
        codebook = {}
    if node:
        if node.char is not None:
            codebook[node.char] = prefix
        build_codes(node.left, prefix + "0", codebook)
        build_codes(node.right, prefix + "1", codebook)
    return codebook

def compress_huffman(text):
    if not text:
        return bytearray(), {}, 0
    tree = build_huffman_tree(text)
    codes = build_codes(tree)
    encoded_bits = ''.join(codes[char] for char in text)
    
    padding = 8 - (len(encoded_bits) % 8)
    if padding == 8:
        padding = 0
        
    encoded_bits += '0' * padding
    
    b_arr = bytearray()
    for i in range(0, len(encoded_bits), 8):
        byte = encoded_bits[i:i+8]
        b_arr.append(int(byte, 2))
        
    return b_arr, codes, padding

def decompress_huffman(b_arr, codes, padding):
    if not b_arr or not codes:
        return ""
    
    reverse_codes = {v: k for k, v in codes.items()}
    
    bits = ""
    for byte in b_arr:
        bits += f"{byte:08b}"
        
    if padding > 0:
        bits = bits[:-padding]
        
    decoded_text = ""
    current_code = ""
    for bit in bits:
        current_code += bit
        if current_code in reverse_codes:
            decoded_text += reverse_codes[current_code]
            current_code = ""
            
    return decoded_text

def get_tree_json(node, id_counter=0):
    if node is None:
        return None, id_counter
    
    current_id = str(id_counter)
    id_counter += 1
    
    result = {
        "name": repr(node.char) if node.char is not None else "Int",
        "freq": node.freq,
        "id": current_id
    }
    
    children = []
    if node.left:
        left_child, id_counter = get_tree_json(node.left, id_counter)
        # add a property to indicate left vs right edge for visualization
        left_child["edge"] = "0"
        children.append(left_child)
    if node.right:
        right_child, id_counter = get_tree_json(node.right, id_counter)
        right_child["edge"] = "1"
        children.append(right_child)
        
    if children:
        result["children"] = children
        
    return result, id_counter
