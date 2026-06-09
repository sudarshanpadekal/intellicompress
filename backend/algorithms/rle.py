def compress_rle(text):
    if not text:
        return bytearray(), {}, 0
    
    encoded = ""
    i = 0
    while i < len(text):
        count = 1
        while i + 1 < len(text) and text[i] == text[i + 1]:
            i += 1
            count += 1
        encoded += str(count) + text[i]
        i += 1
        
    return encoded.encode('utf-8')

def decompress_rle(b_arr):
    if not b_arr:
        return ""
    
    text = b_arr.decode('utf-8')
    decoded = ""
    i = 0
    while i < len(text):
        count_str = ""
        while i < len(text) and text[i].isdigit():
            count_str += text[i]
            i += 1
        if i < len(text):
            char = text[i]
            count = int(count_str) if count_str else 1
            decoded += char * count
            i += 1
            
    return decoded
