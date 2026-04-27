# ============================================================
# CLOSEST VECTOR PROBLEM (CVP) using Babai's Algorithm
# ============================================================
# A LATTICE is a grid of points in space made by combining
# two or more basis vectors with integer coefficients.
#
# Example: Basis vectors b1 = [1,0] and b2 = [0,1]
#          creates the standard integer grid.
#
# THE PROBLEM:
#   Given a target point w (that may NOT be on the lattice),
#   find the CLOSEST lattice point to w.
#
# BABAI'S ALGORITHM (simple approach):
#   Step 1: Express w in terms of basis vectors (solve linear system)
#   Step 2: Round each coefficient to the nearest integer
#   Step 3: Reconstruct the lattice point using rounded coefficients
#
# WHY THIS MATTERS IN CRYPTOGRAPHY:
#   CVP is HARD to solve for big lattices.
#   GGH cryptosystem encrypts by adding noise, then uses
#   a "good" basis to solve CVP and recover the message.
# ============================================================

import numpy as np


# ============================================================
# HELPER: Calculate length (norm) of a vector
# ============================================================
def norm(v):
    return np.linalg.norm(v)


# ============================================================
# BABAI'S CLOSEST VECTOR ALGORITHM
# ============================================================
def babai_closest_vector(basis, w):
    print("\n" + "=" * 60)
    print("CLOSEST VECTOR PROBLEM (CVP) - Babai's Algorithm")
    print("=" * 60)

    # Build basis matrix (each basis vector is a COLUMN)
    B = np.array(basis).T
    w = np.array(w)

    print("\nBasis Matrix B (columns = basis vectors):")
    print(B)

    print("\nTarget Vector w:")
    print(w)

    # -----------------------------------------------
    # STEP 1: Solve B * x = w  to find coefficients x
    # -----------------------------------------------
    print("\nStep 1: Solve B*x = w to find real-valued coefficients")

    try:
        coeffs = np.linalg.solve(B, w)   # x = B^(-1) * w
    except:
        print("ERROR: Basis matrix is not invertible!")
        return None

    print(f"  Exact coefficients: {coeffs}")

    # -----------------------------------------------
    # STEP 2: Round each coefficient to nearest integer
    # -----------------------------------------------
    rounded = np.round(coeffs).astype(int)
    print(f"\nStep 2: Round coefficients -> {rounded}")

    # -----------------------------------------------
    # STEP 3: Reconstruct lattice vector using rounded coefficients
    # -----------------------------------------------
    v = B @ rounded   # v = B * rounded_coefficients
    print(f"\nStep 3: Closest lattice vector v = B * rounded = {v}")

    # -----------------------------------------------
    # STEP 4: Calculate how close we got
    # -----------------------------------------------
    distance = norm(w - v)
    print(f"\nDistance from w to v = ||w - v|| = {round(distance, 4)}")

    print("\n" + "=" * 60)
    print("RESULT")
    print("=" * 60)
    print(f"Target vector w        = {w}")
    print(f"Closest lattice vector = {v}")
    print(f"Distance               = {round(distance, 4)}")

    return v


# ============================================================
# MAIN PROGRAM
# ============================================================
if __name__ == "__main__":

    print("\n===== CLOSEST VECTOR PROBLEM (CVP) =====")

    n = int(input("Enter dimension n (e.g., 2 for 2D): "))

    basis = []
    print(f"\nEnter {n} basis vectors (each has {n} components):")

    for i in range(n):
        vec = list(map(float, input(f"Basis vector v{i+1}: ").split()))
        basis.append(vec)

    w = list(map(float, input("\nEnter target vector w: ").split()))

    # Run Babai's algorithm
    v = babai_closest_vector(basis, w)

    # Verify result
    print("\nVerification:")
    if v is not None:
        print("Closest vector computed successfully!")
    else:
        print("Failed to compute closest vector.")


# ============================================================
# EXAMPLE INPUT:
# n = 2
# v1: 137 312
# v2: 215 -187
# w: 53172 81743
# ============================================================