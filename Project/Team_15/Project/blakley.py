import random

def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def get_prime_input():
    while True:
        p = int(input("Enter a prime number (p): "))
        if is_prime(p):
            return p
        else:
            print("Invalid input. Please enter a prime number.")

p = get_prime_input()

# Generate a random secret
secret = int(input())

A = [[4, 19, -1], [52, 27, -1], [36, 65, -1]]
B = [-68, -10, -18]

print("A=", A)
print("B=", B)

def inverse_matrix_mod_p(matrix, p):
    det_inv = modinv(matrix_determinant(matrix, p), p)
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

def modinv(a, m):
    m0, x0, x1 = m, 0, 1
    while a > 1:
        q = a // m
        m, a = a % m, m
        x0, x1 = x1 - q * x0, x0
    return x1 + m0 if x1 < 0 else x1

def scalar_multiply(matrix, scalar, p):
    return [[(element * scalar) % p for element in row] for row in matrix]

A_inv = inverse_matrix_mod_p(A, p)
print("Inverse A (mod p):", A_inv)

# Generate shares for the secret
shares = [sum(a * secret % p for a in row) for row in A]
print("Shares:", shares)

# Reconstruct the secret
reconstructed_secret = sum(a * b % p for a, b in zip(A_inv[0], shares)) % p
print("Reconstructed Secret:", reconstructed_secret)
