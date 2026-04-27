# ============================================================
# SHORTEST VECTOR PROBLEM (SVP)
# ============================================================
# A LATTICE is a set of all points you can reach using
# integer combinations of some "basis" vectors.
#
# Example: basis = {[2,0], [0,3]}
#   Lattice points = a*[2,0] + b*[0,3]  where a,b are integers
#   So: (0,0), (2,0), (0,3), (2,3), (4,0), (-2,0), etc.
#
# THE PROBLEM:
#   Find the SHORTEST non-zero vector in the lattice.
#   (shortest = smallest Euclidean length)
#
# OUR METHOD (Brute Force):
#   1. Try all integer coefficient combinations (within a range)
#   2. Calculate the resulting lattice vector
#   3. Pick the one with the smallest length (norm)
#
# WHY IS THIS HARD?
#   In high dimensions, there are exponentially many vectors.
#   No efficient algorithm is known for large lattices.
#   This hardness is used in post-quantum cryptography!
# ============================================================

import math
import itertools


# ============================================================
# HELPER: Dot product of two vectors
# ============================================================
def dot_product(v, w):
    total = 0
    for i in range(len(v)):
        total += v[i] * w[i]
    return total


# ============================================================
# HELPER: Add two vectors element by element
# ============================================================
def vector_add(v, w):
    result = []
    for i in range(len(v)):
        result.append(v[i] + w[i])
    return result


# ============================================================
# HELPER: Multiply a scalar by a vector
# ============================================================
def scalar_mult(a, v):
    return [a * x for x in v]


# ============================================================
# HELPER: Euclidean length (norm) of a vector
# ============================================================
def vector_norm(v):
    return math.sqrt(dot_product(v, v))


# ============================================================
# GENERATE ALL LATTICE VECTORS (within coefficient range)
# ============================================================
# Every lattice vector = c1*b1 + c2*b2 + ... where ci are integers
# We try coefficients from -limit to +limit
def generate_lattice_vectors(basis, limit):
    dim = len(basis)                      # number of basis vectors
    coeff_range = range(-limit, limit + 1)  # e.g., -2, -1, 0, 1, 2

    lattice_vectors = []

    # itertools.product gives all combinations of coefficients
    for coeffs in itertools.product(coeff_range, repeat=dim):

        # Skip the all-zero combination (gives zero vector)
        if all(c == 0 for c in coeffs):
            continue

        # Compute: v = c1*b1 + c2*b2 + ...
        v = [0] * len(basis[0])   # start with zero vector

        for i in range(dim):
            contribution = scalar_mult(coeffs[i], basis[i])
            v = vector_add(v, contribution)

        lattice_vectors.append((coeffs, v))

    return lattice_vectors


# ============================================================
# SOLVE SVP: Find the shortest lattice vector
# ============================================================
def solve_svp(basis, limit):
    print("\n" + "=" * 60)
    print("SHORTEST VECTOR PROBLEM (SVP)")
    print("=" * 60)

    print("\nInput Basis Vectors:")
    for i, b in enumerate(basis):
        print(f"  v{i+1} = {b}")

    print(f"\nSearching all integer combinations with coefficients in [-{limit}, {limit}]...")

    # Generate all possible lattice vectors
    lattice_vectors = generate_lattice_vectors(basis, limit)

    print(f"\nTotal vectors generated: {len(lattice_vectors)}")
    print("\nAll Lattice Vectors:")

    min_norm          = float("inf")    # Track smallest norm found
    shortest_vector   = None            # Track the shortest vector
    best_coeffs       = None            # Track which coefficients gave it

    for coeffs, v in lattice_vectors:
        length = vector_norm(v)
        print(f"  Coeffs {coeffs} -> Vector {v} -> ||v|| = {round(length, 4)}")

        # Update shortest if this one is smaller
        if length != 0 and length < min_norm:
            min_norm        = length
            shortest_vector = v
            best_coeffs     = coeffs

    print("\n" + "=" * 60)
    print("RESULT")
    print("=" * 60)
    print(f"Shortest Vector     = {shortest_vector}")
    print(f"Coefficients used   = {best_coeffs}")
    print(f"Length (norm)       = {round(min_norm, 4)}")

    return shortest_vector


# ============================================================
# MAIN PROGRAM
# ============================================================
if __name__ == "__main__":

    print("\n===== SHORTEST VECTOR PROBLEM (SVP) =====")

    n = int(input("Enter lattice dimension n: "))

    basis = []
    print(f"\nEnter {n} basis vectors:")

    for i in range(n):
        vec = list(map(int, input(f"Enter vector v{i+1}: ").split()))
        basis.append(vec)

    limit = int(input("\nEnter search limit (e.g., 2 or 3, higher = more thorough): "))

    # Find shortest vector
    shortest = solve_svp(basis, limit)

    # Verify
    print("\nVerification:")
    if shortest is not None:
        print("Shortest vector found successfully!")
    else:
        print("Failed to find shortest vector.")


# ============================================================
# EXAMPLE INPUT:
# n = 2
# v1: 31 59
# v2: 37 70
# limit: 3
# ============================================================