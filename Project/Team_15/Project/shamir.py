import random

_PRIME = 2 ** 127 - 1

def _eval_at(poly, x, prime):
    """Evaluates polynomial (coefficient tuple) at x."""
    accum = 0
    for coeff in reversed(poly):
        accum *= x
        accum += coeff
        accum %= prime
    return accum

def make_random_shares(secret, minimum, shares, prime=_PRIME):
    if minimum > shares:
        raise ValueError("Pool secret would be irrecoverable.")
    poly = [secret] + [random.randint(0, prime - 1) for _ in range(minimum - 1)]
    points = [(i, _eval_at(poly, i, prime)) for i in range(1, shares + 1)]
    return points

def _extended_gcd(a, b):
    x = 0
    last_x = 1
    y = 1
    last_y = 0
    while b != 0:
        quot = a // b
        a, b = b, a % b
        x, last_x = last_x - quot * x, x
        y, last_y = last_y - quot * y, y
    return last_x, last_y

def _divmod(num, den, p):
    inv, _ = _extended_gcd(den, p)
    return num * inv

def _lagrange_interpolate(x, x_s, y_s, p):
    k = len(x_s)
    nums = [1] * k
    dens = [1] * k
    for i in range(k):
        for j in range(k):
            if i != j:
                nums[i] *= x - x_s[j]
                dens[i] *= x_s[i] - x_s[j]
    den = dens[0]
    num = sum([_divmod(nums[i] * den * y_s[i] % p, dens[i], p) for i in range(k)])
    return (_divmod(num, den, p) + p) % p

def recover_secret(shares, prime=_PRIME):
    if len(shares) < 3:
        raise ValueError("need at least three shares")
    x_s, y_s = zip(*shares)
    return _lagrange_interpolate(0, x_s, y_s, prime)

def main():
    secret = int(input("Enter the secret: "))
    minimum = int(input("Enter the minimum number of shares required: "))
    total_shares = int(input("Enter the total number of shares to generate: "))

    shares = make_random_shares(secret, minimum, total_shares)

    print('Secret:                                                     ', secret)
    print('Shares:')
    if shares:
        for share in shares:
            print('  ', share)

    input_shares = []
    while len(input_shares) < minimum:
        share_input = input("Enter a share (format: x,y): ")
        try:
            x, y = map(int, share_input.split(','))
            input_shares.append((x, y))
        except ValueError:
            print("Invalid input. Please enter a valid share.")

    recovered_secret = recover_secret(input_shares)
    print('Secret recovered from input shares:                         ', recovered_secret)

if __name__ == '__main__':
    main()

