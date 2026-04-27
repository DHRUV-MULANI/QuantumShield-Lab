# ============================================================
# GGH CRYPTOSYSTEM (Goldreich-Goldwasser-Halevi)
# ============================================================
# GGH is a lattice-based public key cryptosystem.
# Its security is based on the hardness of CVP (Closest Vector Problem).
#
# KEY IDEA:
#   - Have TWO bases for the SAME lattice:
#       * GOOD BASIS (private): nearly orthogonal, easy to solve CVP
#       * BAD BASIS  (public):  messy, hard to solve CVP
#
# HOW ENCRYPTION WORKS:
#   c = m * W + r
#   (message vector m times public bad basis W, plus small noise r)
#
# HOW DECRYPTION WORKS:
#   Use Babai's algorithm with the GOOD basis to find the
#   closest lattice point, then recover m by inverting W.
#
# WHY CAN ONLY THE OWNER DECRYPT?
#   Only the private good basis allows solving CVP easily.
#   With the public bad basis, CVP is hard to solve.
# ============================================================

import numpy as np


# ============================================================
# HELPER: Vector norm (length)
# ============================================================
def norm(v):
    return np.linalg.norm(v)


# ============================================================
# BABAI'S ALGORITHM (Closest Vector using a basis)
# ============================================================
# Given a basis B and target point w,
# find the closest lattice point using the rounding trick.
def babai(B, w):
    B = np.array(B).T     # Make each row of B a COLUMN vector
    w = np.array(w)

    # Step 1: Find real coefficients: x = B^(-1) * w
    coeffs = np.linalg.solve(B, w)

    # Step 2: Round to nearest integers
    rounded = np.round(coeffs).astype(int)

    # Step 3: Reconstruct closest lattice point
    v = B @ rounded

    return v


# ============================================================
# MAIN PROGRAM
# ============================================================
if __name__ == "__main__":

    print("\n===== GGH CRYPTOSYSTEM =====")

    n = int(input("Enter dimension n: "))

    # ----- PRIVATE KEY: GOOD BASIS V -----
    print("\nEnter PRIVATE (good) basis vectors:")
    print("  (These should be nearly orthogonal for easy decryption)")
    V = []
    for i in range(n):
        vec = list(map(int, input(f"v{i+1}: ").split()))
        V.append(vec)

    V = np.array(V)

    # ----- UNIMODULAR MATRIX U -----
    # A unimodular matrix has determinant = +1 or -1
    # Multiplying by U changes the basis but keeps the SAME lattice
    print("\nEnter UNIMODULAR matrix U (det must be +1 or -1):")
    print("  This is used to generate the public bad basis from the private good basis")
    U = []
    for i in range(n):
        row = list(map(int, input(f"U row {i+1}: ").split()))
        U.append(row)

    U = np.array(U)

    # ----- KEY GENERATION -----
    # Public key W = U * V   (a "bad" messy basis for the same lattice)
    W = U @ V

    print("\n========== KEY GENERATION ==========")
    print("Private basis V (good - kept secret):")
    print(V)

    print("\nPublic basis W = U * V  (bad - shared openly):")
    print(W)

    print(f"\nDet(U) = {round(np.linalg.det(U))}  (should be +1 or -1)")

    # ----- MESSAGE -----
    print("\nEnter message vector m (integer vector):")
    m = np.array(list(map(int, input().split())))

    # ----- NOISE VECTOR -----
    print("\nEnter small noise/error vector r:")
    print("  (Small integers like 1, -1, 0 work best)")
    r = np.array(list(map(int, input().split())))

    # ============================================================
    # ENCRYPTION: c = m * W + r
    # ============================================================
    print("\n========== ENCRYPTION ==========")

    mW = m @ W          # Use public key W
    c  = mW + r         # Add small noise to hide message

    print(f"Step 1: m * W = {mW}")
    print(f"Step 2: Add noise r = {r}")
    print(f"Ciphertext c = m*W + r = {c}")

    # ============================================================
    # DECRYPTION using Babai's algorithm with PRIVATE basis
    # ============================================================
    print("\n========== DECRYPTION ==========")

    # Step 1: Find closest lattice point using GOOD (private) basis
    v = babai(V.tolist(), c.tolist())
    print(f"Step 1: Closest lattice point v = {v}  (using private basis + Babai)")

    # Step 2: Recover message: m = v * W^(-1)
    W_inv = np.linalg.inv(W)
    m_recovered = np.round(v @ W_inv).astype(int)
    print(f"Step 2: m = v * W^(-1) = {m_recovered}")

    # ============================================================
    # VERIFICATION
    # ============================================================
    print("\n========== VERIFICATION ==========")
    print(f"Original message  = {m}")
    print(f"Recovered message = {m_recovered}")

    if np.array_equal(m, m_recovered):
        print("SUCCESS - GGH Decryption worked!")
    else:
        print("FAILED - Noise may have been too large!")


# ============================================================
# EXAMPLE INPUT:
# n = 2
#
# Private basis V (good):
# v1: 4 13
# v2: -57 -45
#
# Unimodular matrix U:
# 2 3
# 3 5
#
# Message vector m:
# 2 -5
#
# Noise vector r:
# 1 -1
# ============================================================
