# ============================================================
# ELLIPTIC CURVE DIFFIE-HELLMAN (ECDH)
# ============================================================
# ECDH is a key exchange protocol.
# Alice and Bob want to create a SHARED SECRET KEY
# without sending it over the network.
#
# How it works:
#   1. Both agree on a public elliptic curve and base point G
#   2. Alice picks private key dA, computes public key QA = dA * G
#   3. Bob picks private key dB, computes public key QB = dB * G
#   4. Alice computes: S = dA * QB
#   5. Bob computes:   S = dB * QA
#   6. Both get the SAME point S! (It's the shared secret)
#
# Why is this secure?
#   Even if hacker sees QA and QB, they can't find dA or dB
#   because reversing point multiplication is very hard.
# ============================================================


# ============================================================
# HELPER: Modular Inverse
# ============================================================
def mod_inv(a, p):
    return pow(a, -1, p)    # Python computes this efficiently


# ============================================================
# HELPER: Add two points on elliptic curve
# ============================================================
def point_add(P, Q, a, p):
    # "O" = point at infinity (identity element)
    if P == "O":
        return Q
    if Q == "O":
        return P

    x1, y1 = P
    x2, y2 = Q

    # If points cancel each other out -> return infinity
    if x1 == x2 and (y1 + y2) % p == 0:
        return "O"

    # Calculate slope
    if P != Q:
        # Two different points
        m = ((y2 - y1) * mod_inv(x2 - x1, p)) % p
    else:
        # Doubling same point
        m = ((3 * x1 * x1 + a) * mod_inv(2 * y1, p)) % p

    # New point
    x3 = (m * m - x1 - x2) % p
    y3 = (m * (x1 - x3) - y1) % p

    return (x3, y3)


# ============================================================
# HELPER: Multiply point P by scalar k  (i.e., k * P)
# ============================================================
def scalar_mult(k, P, a, p):
    result = "O"     # Start from identity
    temp = P         # We'll keep doubling this

    while k > 0:
        if k % 2 == 1:
            result = point_add(result, temp, a, p)   # Add if bit is 1
        temp = point_add(temp, temp, a, p)           # Always double
        k = k // 2                                   # Next bit

    return result


# ============================================================
# HELPER: Check if a point lies on the curve
# ============================================================
def is_on_curve(P, a, b, p):
    if P == "O":
        return True
    x, y = P
    # y^2 must equal x^3 + ax + b  (mod p)
    return (y * y - (x * x * x + a * x + b)) % p == 0


# ============================================================
# MAIN PROGRAM
# ============================================================
if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("ELLIPTIC CURVE DIFFIE-HELLMAN (ECDH)")
    print("=" * 60)

    # ----- PUBLIC CURVE PARAMETERS (everyone knows these) -----
    print("\nEnter curve: y^2 = x^3 + ax + b  (mod p)")
    p = int(input("Enter prime p: "))
    a = int(input("Enter a: "))
    b = int(input("Enter b: "))

    print("\nEnter base point G (publicly known):")
    Gx = int(input("Gx: "))
    Gy = int(input("Gy: "))
    G = (Gx, Gy)

    # Check G is on the curve
    if not is_on_curve(G, a, b, p):
        print("ERROR: G is not on the curve!")
        exit()

    print("\n========== PUBLIC PARAMETERS ==========")
    print(f"Curve: y^2 = x^3 + {a}x + {b}  mod {p}")
    print(f"Base point G = {G}")

    # ----- ALICE'S KEYS -----
    dA = int(input("\nEnter Alice's private key dA: "))
    QA = scalar_mult(dA, G, a, p)    # Alice's public key

    print("\n---------- ALICE ----------")
    print(f"Alice's private key dA = {dA}  (SECRET, never share!)")
    print(f"Alice's public key  QA = dA*G = {QA}  (share with Bob)")

    # ----- BOB'S KEYS -----
    dB = int(input("\nEnter Bob's private key dB: "))
    QB = scalar_mult(dB, G, a, p)    # Bob's public key

    print("\n---------- BOB ----------")
    print(f"Bob's private key dB = {dB}  (SECRET, never share!)")
    print(f"Bob's public key  QB = dB*G = {QB}  (share with Alice)")

    # ----- SHARED SECRET COMPUTATION -----
    print("\n========== SHARED SECRET COMPUTATION ==========")

    # Alice uses her private key and Bob's public key
    SA = scalar_mult(dA, QB, a, p)

    # Bob uses his private key and Alice's public key
    SB = scalar_mult(dB, QA, a, p)

    print(f"Alice computes: S = dA * QB = {SA}")
    print(f"Bob computes:   S = dB * QA = {SB}")

    # ----- VERIFICATION -----
    print("\n========== VERIFICATION ==========")

    if SA == SB:
        print("SUCCESS - Both computed the SAME shared secret!")
        print("Shared Secret =", SA)
        print("Now Alice and Bob can use this as their encryption key!")
    else:
        print("FAILED - Shared secrets don't match!")


# ============================================================
# EXAMPLE INPUT:
# p = 17, a = 2, b = 2
# G = (5, 1)
# Alice's dA = 2
# Bob's dB = 3
# ============================================================