from flask import Flask, render_template, request, session
from shamir import *

app = Flask(__name__)
app.secret_key = 'hello'
#--------------------------------- mignotte -----------------------------------------------
from random import randint

def generate_prime(bitsize,m):
    while True:
        num = randint(2**(bitsize-1), 2**bitsize - 1)
        if isprime(num) and num not in m:
            return num

def isprime(num):
    if num < 2:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

def solve_crt(rem, mod):
    M = 1
    for m in mod:
        M *= m

    result = 0
    for i in range(len(rem)):
        Mi = M // mod[i]
        if Mi == 0:
            continue
        Mi_inv = modinv(Mi, mod[i])
        result += rem[i] * Mi * Mi_inv

    return result % M

def modinv(a, m):
    m0, x0, x1 = m, 0, 1
    while a > 1:
        q = a // m
        m, a = a % m, m
        x0, x1 = x1 - q * x0, x0
    return x1 + m0 if x1 < 0 else x1

#-------------------------------------mignotte-------------------------------------------------------------------

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def get_prime_input(p):
    while True:
        if is_prime(p):
            return p
        else:
            print("Invalid input. Please enter a prime number.")

def inverse_matrix_mod_p(matrix, p):
    det_inv = mod_inv(matrix_determinant(matrix, p), p)
    adj_matrix = matrix_adjugate(matrix)
    return scalar_multiply(adj_matrix, det_inv, p)

def matrix_determinant(matrix, p):
    return (matrix[0][0] * matrix[1][1] * matrix[2][2] +
            matrix[0][1] * matrix[1][2] * matrix[2][0] +
            matrix[0][2] * matrix[1][0] * matrix[2][1] -
            matrix[0][2] * matrix[1][1] * matrix[2][0] -
            matrix[0][1] * matrix[1][0] * matrix[2][2] -
            matrix[0][0] * matrix[1][2] * matrix[2][1]) % p

def matrix_adjugate(matrix):
    return [
        [matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1], matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2],
         matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]],
        [matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2], matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0],
         matrix[0][2] * matrix[1][0] - matrix[0][0] * matrix[1][2]],
        [matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0], matrix[0][1] * matrix[2][0] - matrix[0][0] * matrix[2][1],
         matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]]
    ]

def mod_inv(a, m):
    m0, x0, x1 = m, 0, 1
    while a > 1:
        q = a // m
        m, a = a % m, m
        x0, x1 = x1 - q * x0, x0
    return x1 + m0 if x1 < 0 else x1

def scalar_multiply(matrix, scalar, p):
    return [[(element * scalar) % p for element in row] for row in matrix]

 #-----------------------------------------------------blakley--------------------------------------------------------------------------------
 
def main():
    data = request.get_json()
    button_id = data.get('id')
    if button_id == "button1":
        shamir()
    elif button_id == "button2":
        blakley()
    else:
        mignotte()

@app.route('/blakley', methods=['GET', 'POST'])
def blakley():
    if request.method == 'POST':
        p = int(request.form['p'])
        secret = int(request.form['secret'])
        p = get_prime_input(p)

        A = [[4, 19, -1], [52, 27, -1], [36, 65, -1]]

        A_inv = inverse_matrix_mod_p(A, p)

        shares = [sum(a * secret % p for a in row) for row in A]
        reconstructed_secret = sum(a * b % p for a, b in zip(A_inv[0], shares)) % p

        return render_template('result_blakley.html', secret=secret, shares=shares, reconstructed_secret=reconstructed_secret)

    return render_template('blakley.html', error="")


def shamir():
    global shares
    secret = int(request.form.get['secret'])
    minimum = int(request.form.get['minimum'])
    total_shares = int(request.form['total_shares'])

    shares = make_random_shares(secret, minimum, total_shares)
    print('Secret:', secret)
    print('Shares:')
    for share in shares:
        print('  ', share)

@app.route('/')
def welcome():
    return render_template('homepage.html')

@app.route('/shamir.html')
def shamir():
    return render_template('shamir.html')

@app.route('/mignotte.html')
def mignotte():
    return render_template('mignotte.html')

@app.route('/enter_share', methods =['GET', 'POST'])
def compute_mignotte():
    if request.method == 'POST':
        secret = int(request.form['secret'])
        bitsize = 16  # 60-bit primes

        m = [0] * 4  # Array with five values
        share = [0] * 4  # Array with five values

        m[0] = generate_prime(bitsize,m)
        m[1] = generate_prime(bitsize,m)
        m[2] = generate_prime(bitsize,m)
        m[3] = generate_prime(bitsize,m)

        m = sorted(m)

        while m[0] * m[1] * m[2] < m[2] * m[3] and m[3] < m[2]:
            m[3] = generate_prime(bitsize,m)
        
        rand = randint(m[2] * m[3], m[0] * m[1] * m[2])
        secret = rand + secret

        share[0] = secret % m[0]
        share[1] = secret % m[1]
        share[2] = secret % m[2]
        share[3] = secret % m[3]

        mod = [m[0], m[1], m[2]]
        rem1 = [share[0], share[1], share[2]]
        res = solve_crt(rem1, mod)
        three_secret = res - rand

        mod = [m[0], m[1]]
        rem2 = [share[0], share[1]]
        res = solve_crt(rem2, mod)
        two_secret = res - rand

        result = {
        "made_secret": secret,
        "m0": m[0],
        "m1": m[1],
        "m2": m[2],
        "m3": m[3],
        "share0": share[0],
        "share1": share[1],
        "share2": share[2],
        "share3": share[3],
        "three_secret" : three_secret,
        "two_secret" : two_secret
        }
        return render_template('result_mignotte.html', result=result)
    
    return render_template('mignotte.html', error="")

@app.route('/generate_shares', methods=['POST'])
def generate_shares():
    secret = int(request.form['secret'])
    minimum = int(request.form['minimum'])
    total_shares = int(request.form['total_shares'])

    global shares
    shares = make_random_shares(secret, minimum, total_shares)
    session['minimum'] = minimum
    return render_template('shamir_shares.html', secret=secret, shares=shares,minimum=minimum)

@app.route('/recover_secret', methods=['GET', 'POST'])
def recover_secret_view():
    minimum = session.get('minimum', 0)
    if request.method == 'POST':

        input_shares = [
        (
            int(request.form[f"real_part_{i}"]),
            int(request.form[f"imaginary_part_{i}"])
        ) 
        for i in range(minimum)
    ]
        recovered_secret = recover_secret(input_shares)
        return render_template('shamir_recovered_secret.html', recovered_secret=recovered_secret)

if __name__ == '__main__':
    app.run(debug=True,port=0)
