# ============================================================
# NTRU Encryption and Decryption
# ============================================================
# NTRU is a post-quantum cryptography algorithm.
# It works with polynomials (like normal algebra with x).
# Instead of big numbers, we use polynomial rings.
# ============================================================

# ------------------------------------
# HELPER FUNCTION 1: Add two polynomials
# ------------------------------------
def poly_add(a, b, N, mod):
    # Simply add corresponding coefficients and take mod
    result = []
    for i in range(N):
        result.append((a[i] + b[i]) % mod)
    return result


# ------------------------------------
# HELPER FUNCTION 2: Multiply two polynomials
# ------------------------------------
def poly_mul(a, b, N, mod):
    # We multiply and reduce mod x^N - 1
    # This means if index goes past N, we wrap it back
    result = [0] * N
    for i in range(N):
        for j in range(N):
            # (i+j) % N wraps the index back
            index = (i + j) % N
            result[index] = (result[index] + a[i] * b[j]) % mod
    return result


# ------------------------------------
# HELPER FUNCTION 3: Center lift
# ------------------------------------
def center_lift(poly, mod):
    # Instead of values 0 to mod-1,
    # bring them to range -(mod/2) to +(mod/2)
    result = []
    for x in poly:
        x = x % mod
        if x > mod // 2:
            x = x - mod   # shift down to negative
        result.append(x)
    return result


# ------------------------------------
# HELPER FUNCTION 4: Find inverse of a polynomial
# ------------------------------------
# This is like finding 1/f(x) in the polynomial world
# We use Extended Euclidean Algorithm for polynomials
def poly_inv(f, N, mod):

    # Find the degree (highest power with non-zero coefficient)
    def deg(p):
        for i in range(len(p) - 1, -1, -1):
            if p[i] != 0:
                return i
        return -1

    # Remove trailing zeros from polynomial list
    def trim(p):
        while len(p) > 1 and p[-1] == 0:
            p.pop()
        return p

    # Add two polynomials (without mod reduction on size)
    def add(a, b):
        size = max(len(a), len(b))
        res = [0] * size
        for i in range(len(a)):
            res[i] = (res[i] + a[i]) % mod
        for i in range(len(b)):
            res[i] = (res[i] + b[i]) % mod
        return trim(res)

    # Subtract two polynomials
    def sub(a, b):
        size = max(len(a), len(b))
        res = [0] * size
        for i in range(len(a)):
            res[i] = (res[i] + a[i]) % mod
        for i in range(len(b)):
            res[i] = (res[i] - b[i]) % mod
        return trim(res)

    # Multiply two polynomials (full, not reduced mod x^N-1)
    def mul(a, b):
        res = [0] * (len(a) + len(b))
        for i in range(len(a)):
            for j in range(len(b)):
                res[i + j] = (res[i + j] + a[i] * b[j]) % mod
        return trim(res)

    # Polynomial long division: returns (quotient, remainder)
    def divmod_poly(a, b):
        a = a[:]
        b = trim(b[:])
        inv = pow(b[deg(b)], -1, mod)   # modular inverse of leading coeff

        q = [0] * len(a)
        while deg(a) >= deg(b):
            d = deg(a) - deg(b)
            coef = a[deg(a)] * inv % mod
            q[d] = coef
            for i in range(deg(b) + 1):
                a[i + d] = (a[i + d] - coef * b[i]) % mod
        return trim(q), trim(a)

    # x^N - 1 (the modulus polynomial)
    xN = [(-1) % mod] + [0] * (N - 1) + [1]

    # Extend f to length N+1
    f_ext = f[:] + [0] * (N + 1 - len(f))

    # Extended GCD loop
    r0, r1 = xN, f_ext
    t0, t1 = [0], [1]

    while deg(r1) >= 0:
        q, r = divmod_poly(r0, r1)
        r0, r1 = r1, r
        t0, t1 = t1, sub(t0, mul(q, t1))
        if deg(r1) < 0:
            break

    if deg(r0) != 0:
        return None   # Inverse doesn't exist

    inv_const = pow(r0[0], -1, mod)
    inv_poly = [(c * inv_const) % mod for c in t0]

    # Reduce mod x^N - 1
    res = [0] * N
    for i, c in enumerate(inv_poly):
        res[i % N] = (res[i % N] + c) % mod

    return res


# ------------------------------------
# HELPER FUNCTION 5: Print polynomial nicely
# ------------------------------------
def poly_to_str(poly):
    terms = []
    for i in range(len(poly) - 1, -1, -1):
        c = poly[i]
        if c == 0:
            continue
        if i == 0:
            terms.append(str(c))
        elif i == 1:
            terms.append(f"{c}x" if abs(c) != 1 else ("x" if c == 1 else "-x"))
        else:
            terms.append(f"{c}x^{i}" if abs(c) != 1 else (f"x^{i}" if c == 1 else f"-x^{i}"))
    return " + ".join(terms).replace("+ -", "- ") if terms else "0"


# ------------------------------------
# HELPER FUNCTION 6: Pad polynomial to length N
# ------------------------------------
def pad(p, N):
    return p + [0] * (N - len(p))


# ============================================================
# KEY GENERATION
# ============================================================
def keygen(N, p, q, f, g):
    print("\n========== KEY GENERATION ==========")

    # Find inverse of f mod q  (used in key generation)
    Fq = poly_inv(f, N, q)

    # Find inverse of f mod p  (used in decryption)
    Fp = poly_inv(f, N, p)

    print("Fq (inverse of f mod q) =", poly_to_str(Fq))
    print("Fp (inverse of f mod p) =", poly_to_str(Fp))

    # Public key h = Fq * g mod q
    h = poly_mul(Fq, g, N, q)
    print("Public key h =", poly_to_str(h))

    # Return public key and Fp (needed for decryption)
    return h, Fp


# ============================================================
# ENCRYPTION
# ============================================================
def encrypt(m, r, h, N, p, q):
    print("\n========== ENCRYPTION ==========")

    # Step 1: Compute h * r mod q
    hr = poly_mul(h, r, N, q)

    # Step 2: Multiply by p
    phr = [(p * x) % q for x in hr]

    # Step 3: Add message m
    c = poly_add(phr, m, N, q)

    print("h*r =", poly_to_str(hr))
    print("p*h*r =", poly_to_str(phr))
    print("Ciphertext c = p*h*r + m =", poly_to_str(c))

    return c


# ============================================================
# DECRYPTION
# ============================================================
def decrypt(c, f, Fp, N, p, q):
    print("\n========== DECRYPTION ==========")

    # Step 1: Compute f * c mod q
    a = poly_mul(f, c, N, q)
    print("f*c =", poly_to_str(a))

    # Step 2: Center lift (bring values into range around 0)
    a = center_lift(a, q)
    print("After center lift mod q =", poly_to_str(a))

    # Step 3: Reduce mod p
    a = [x % p for x in a]
    a = center_lift(a, p)

    # Step 4: Multiply by Fp to get original message
    m = poly_mul(Fp, a, N, p)
    m = center_lift(m, p)

    print("Recovered message m =", poly_to_str(m))
    return m


# ============================================================
# MAIN PROGRAM - This runs when you execute the file
# ============================================================
if __name__ == "__main__":

    print("\n===== NTRU ENCRYPTION/DECRYPTION =====")
    print("Enter polynomial ring parameters:")

    N = int(input("Enter N (degree of polynomial ring): "))
    p = int(input("Enter p (small modulus): "))
    q = int(input("Enter q (large modulus, must be > p): "))

    print("\nEnter polynomial coefficients (lowest power first, space separated)")
    print("Example: '1 0 -1' means 1 + 0x - x^2")

    f = pad(list(map(int, input("Private key f(x): ").split())), N)
    g = pad(list(map(int, input("Private key g(x): ").split())), N)
    m = pad(list(map(int, input("Message m(x): ").split())), N)
    r = pad(list(map(int, input("Random blinding r(x): ").split())), N)

    # Run all three phases
    h, Fp = keygen(N, p, q, f, g)
    c = encrypt(m, r, h, N, p, q)
    m_recovered = decrypt(c, f, Fp, N, p, q)

    print("\n========== FINAL RESULT ==========")
    print("Original message  :", poly_to_str(m))
    print("Recovered message :", poly_to_str(m_recovered))

    if m == m_recovered:
        print("SUCCESS - Decryption worked correctly!")
    else:
        print("FAILED - Something went wrong!")

# ============================================================
# EXAMPLE INPUT:
# N = 7, p = 3, q = 41
# f = -1 1 1 0 -1 0 1
# g = 1 0 1 1 0 1 0
# m = 0 1 0 0 1 -1 0
# r = 1 -1 0 1 0 0 0
# ============================================================