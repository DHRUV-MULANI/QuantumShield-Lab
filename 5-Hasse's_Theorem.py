# ============================================================
# HASSE'S THEOREM ON ELLIPTIC CURVES
# ============================================================
# Hasse's Theorem tells us:
#   How many points are on an elliptic curve over a finite field?
#
# The theorem says the number of points N satisfies:
#   |N - (p + 1)| <= 2 * sqrt(p)
#
# In simpler words:
#   N is always "close" to p+1
#   It can't be too far from p+1 (within 2*sqrt(p))
#
# Why is this useful?
#   In cryptography, we need curves with large group orders.
#   Hasse's theorem guarantees the order is approximately p.
# ============================================================

import math


# ============================================================
# COUNT ALL POINTS ON THE CURVE
# ============================================================
# Brute force: try every x from 0 to p-1
# For each x, check if y^2 = x^3 + ax + b has a solution
def count_points(a, b, p):
    points = []

    for x in range(p):
        # Calculate right side: x^3 + ax + b  (mod p)
        rhs = (x**3 + a * x + b) % p

        # Try every y and check if y^2 == rhs (mod p)
        for y in range(p):
            if (y * y) % p == rhs:
                points.append((x, y))   # This point is on the curve!

    return points


# ============================================================
# DISPLAY HASSE'S THEOREM VERIFICATION
# ============================================================
def print_hasse(a, b, p):

    print("\n" + "=" * 55)
    print(f"  Curve: y^2 = x^3 + {a}x + {b}  over F{p}")
    print("=" * 55)

    # Get all points on the curve
    points = count_points(a, b, p)

    print("\n  All points on the curve (including infinity = O):")
    print("  O (point at infinity)")  # Always included

    # Print points nicely, 6 per row
    for i in range(0, len(points), 6):
        row = points[i:i + 6]
        print("  ", ", ".join(str(pt) for pt in row))

    # N = total points including point at infinity
    N = len(points) + 1

    print(f"\n  Total points N = {N}  (includes point at infinity)")

    # Calculate Hasse bound values
    p_plus_1   = p + 1
    two_sqrt_p = 2 * math.sqrt(p)

    print(f"\n  p        = {p}")
    print(f"  p + 1    = {p_plus_1}")
    print(f"  2*sqrt(p) = {round(two_sqrt_p, 4)}")

    # Hasse bound: lower and upper limits
    lower_bound = p + 1 - two_sqrt_p
    upper_bound = p + 1 + two_sqrt_p

    print(f"\n  Hasse's Bound:")
    print(f"  {round(lower_bound, 4)}  <=  N  <=  {round(upper_bound, 4)}")
    print(f"  Is {N} in range? Let's check...")

    # Trace of Frobenius t = (p + 1) - N
    t = (p + 1) - N

    print(f"\n  Trace of Frobenius t = (p+1) - N = {p+1} - {N} = {t}")
    print(f"  |t| = {abs(t)}")
    print(f"  2*sqrt(p) = {round(two_sqrt_p, 4)}")

    # Check if Hasse condition is satisfied
    is_satisfied = abs(t) <= two_sqrt_p

    if is_satisfied:
        print(f"\n  |t| <= 2*sqrt(p) --> Hasse's Theorem is SATISFIED!")
    else:
        print(f"\n  Hasse's Theorem is NOT satisfied (error in inputs)")


# ============================================================
# MAIN PROGRAM
# ============================================================
if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("HASSE'S THEOREM - ELLIPTIC CURVE POINT COUNTING")
    print("=" * 60)

    p = int(input("\nEnter prime p (the field size): "))
    a = int(input("Enter coefficient a: "))
    b = int(input("Enter coefficient b: "))

    print_hasse(a, b, p)


# ============================================================
# EXAMPLE INPUT:
# p = 23
# a = 1
# b = 1
# ============================================================