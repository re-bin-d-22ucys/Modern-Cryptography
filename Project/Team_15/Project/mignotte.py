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

secret = int(input())

rand = randint(m[2] * m[3], m[0] * m[1] * m[2])
secret = rand + secret

share[0] = secret % m[0]
share[1] = secret % m[1]
share[2] = secret % m[2]
share[3] = secret % m[3]
'''
print("Secret: ", secret)
print("\nPrime0: ", m[0])
print("Prime1: ", m[1])
print("Prime2: ", m[2])
print("Prime3: ", m[3])

print("\nShare 1 (s1,m1): ", share[0], m[0])
print("Share 2 (s2,m2): ", share[1], m[1])
print("Share 3 (s3,m3): ", share[2], m[2])
print("Share 4 (s4,m4): ", share[3], m[3])

print("\nNow using the first three shares and solve CRT")
'''
mod = [m[0], m[1], m[2]]
rem = [share[0], share[1], share[2]]
res = solve_crt(rem, mod)
three_secret = res - rand

#print("Secret: ", res - rand)

#print("\nNow using the first two shares and solve CRT")
mod = [m[0], m[1]]
rem = [share[0], share[1]]
res = solve_crt(rem, mod)
two_secret = res - rand
#print("Secret: ", res - rand)