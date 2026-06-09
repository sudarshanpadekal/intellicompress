def compress_lzw(text):
    if not text:
        return []
        
    dictionary = {chr(i): i for i in range(256)}
    dict_size = 256
    
    w = ""
    result = []
    
    for c in text:
        wc = w + c
        if wc in dictionary:
            w = wc
        else:
            result.append(dictionary[w])
            dictionary[wc] = dict_size
            dict_size += 1
            w = c
            
    if w:
        result.append(dictionary[w])
        
    return result

def decompress_lzw(compressed):
    if not compressed:
        return ""
        
    dictionary = {i: chr(i) for i in range(256)}
    dict_size = 256
    
    w = chr(compressed[0])
    result = [w]
    
    for k in compressed[1:]:
        if k in dictionary:
            entry = dictionary[k]
        elif k == dict_size:
            entry = w + w[0]
        else:
            raise ValueError('Bad compressed k: %s' % k)
            
        result.append(entry)
        
        dictionary[dict_size] = w + entry[0]
        dict_size += 1
        w = entry
        
    return "".join(result)
