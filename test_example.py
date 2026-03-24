#!/usr/bin/env python3
"""
Simple Python script to demonstrate syntax highlighting
"""

def fibonacci(n):
    """Generate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence

class Calculator:
    """A simple calculator class"""

    def __init__(self):
        self.result = 0

    def add(self, x, y):
        """Add two numbers"""
        self.result = x + y
        return self.result

    def multiply(self, x, y):
        """Multiply two numbers"""
        self.result = x * y
        return self.result

if __name__ == "__main__":
    # Test fibonacci function
    print("Fibonacci sequence (10 terms):")
    print(fibonacci(10))

    # Test Calculator class
    calc = Calculator()
    print(f"\n5 + 3 = {calc.add(5, 3)}")
    print(f"4 × 7 = {calc.multiply(4, 7)}")

    # Dictionary example
    data = {
        "name": "Test",
        "value": 42,
        "active": True,
        "items": [1, 2, 3, 4, 5]
    }

    print(f"\nData: {data}")
