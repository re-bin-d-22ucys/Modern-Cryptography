from flask import Flask, render_template, request

app = Flask(__name__)
# app.config.from_object(__name__)

#This code is used to encrypt messages using RC4(Rivest Cipher 4).

"""This function is used to perform xor between two binary strings. We use this this function rather
than using ^ operator because the leading zeroes would be discarded and the size of the output could
be altered which produces wrong outputs."""
def xor_b(b1, b2):
    result = ''
    for bit1, bit2 in zip(b1, b2):
        if bit1==bit2:
            result +='0'
        else:
            result +='1'
    
    return result

# This function is used to change the binary string to hexadecimal string and returns the hexadecimal string.

def toHex(bin):
    vals = [bin[i:i + 8] for i in range(0, len(bin), 8)]
    vals = [chr(int(i,2)) for i in vals]
    text = ''.join(i for i in vals)
    hex = text.encode("utf-8").hex()
    return hex

#This function is used to change the hexadecimal string to binary string and returns the binary string.

def fromHex(hex):
    byte_string = bytes.fromhex(hex)            
    result = byte_string.decode('utf-8')
    m = ''.join([format(ord(j),'08b') for j in result])
    return m

"""This function is used for scheduling the key from the input key to a scheduled key array of length
256. In RC4, the following algorithm is used for key scheduling.This function returns the scheduled 
key list."""

def key_schedule(key):
    S = list(range(256))
    T = list()

    for i in range(len(S)):
        T.append(ord(key[i%len(key)]))

    j = 0
    for i in range(256):
        j = (j + S[i] + T[i]) % 256

        S[i],S[j] = S[j],S[i]
    
    return S
"""This function is used for generating the keystream from the scheduled key and length of the
message. In RC4, the following algorithm is used to generate the keystream which is used for encryption
and decryption."""

def generate_keystream(S,message):
    i,j = 0,0
    p = []
    l = len(message)
    while(l>0):
        i = (i+1) % 256
        j = (j+S[i]) % 256
        S[i],S[j] = S[j],S[i]
        k = S[(S[i]+S[j]) % 256]
        p.append(k)
        l -= 1
    return p

"""This function is used to encrypt the message using the key, changes the message and key
into binary strings and performs XOR for the two binary strings and returns the result in
hexadecimal string.
"""

def encrypt(key,m):
    m = str(m)
    S = key_schedule(list(key))
    k = generate_keystream(S,m)
    
    kf = ''.join([format(i,'08b') for i in k])
    m = ''.join([format(ord(j),'08b') for j in m])


    ct = xor_b(kf,m)

    return toHex(ct)

"""This function is used to decrypt the ciphertext using the key, changes the ciphertext from hexadecimal
string to binary string and key into binary string and performs XOR for the two binary strings and returns
the result in ASCII.
"""

def decrypt(key,c):

    S = key_schedule(list(key))
    try:
        c = fromHex(c)
    except ValueError as e:
        return str(e)
    k = generate_keystream(S,c)    
    kf = ''.join([format(i,'08b') for i in k])

    pt = xor_b(kf,c)

    vals = [pt[i:i + 8] for i in range(0, len(pt), 8)]
    vals = [chr(int(i,2)) for i in vals]
    dec_m = ''.join(i for i in vals)
    return str(dec_m)

@app.route('/')
def welcome():
    return render_template('RC4.html')

@app.route('/', methods=['POST'])
def result():
    var_1 = request.form['var_1']
    var_2 = request.form['var_2']
    if(var_1 == '' or var_2 == ''):
            k = f"Cannot be Implemented"
            entry = "Nothing_to_do!!"
            return render_template('RC4.html',k = k,entry = entry)
    operation = request.form.get("operation")
    if(operation == 'Encrypt' or operation == 'encrypt'):
        result = encrypt(var_2,var_1)
    elif(operation == 'Decrypt' or operation == 'decrypt'):
        for i in var_1:
            if i not in "0123456789abcdef":
                k = f"Ciphertext not in valid hexadecimal form."
                entry = "Not_Valid."
                return render_template('RC4.html',k = k,entry = entry)
        result = decrypt(var_2,var_1)
        if "non-hexadecimal number found in fromhex()" in result:
            k = "Non-hexadecimal is not allowed"
            entry = "Not_Valid."
            return render_template('RC4.html',k = k,entry = entry)
            
    else:
        k = "Invalid operation"
        entry = "Not_Valid."
        return render_template('RC4.html',k = k,entry = entry)
    entry = result
    return render_template('RC4.html', entry=entry)
    

if __name__ == '__main__':
    app.run(debug=True)