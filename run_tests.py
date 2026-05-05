#!/usr/bin/env python3
"""
Test Runner Script for Flask AI Microservice

This script provides an easy way to run the test suite for the
Compliance Obligation Register Flask application.

Usage:
    python run_tests.py              # Run all tests
    python run_tests.py --verbose    # Run with verbose output
    python run_tests.py --coverage   # Run with coverage report
"""

import subprocess
import sys
import os

def run_tests(verbose=False, coverage=False):
    """
    Run the pytest test suite.

    Args:
        verbose (bool): Enable verbose output
        coverage (bool): Generate coverage report
    """
    # Change to the project directory
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)

    # Set PYTHONPATH environment variable for subprocess
    env = os.environ.copy()
    env['PYTHONPATH'] = project_dir

    # Build pytest command
    cmd = ['pytest']

    if verbose:
        cmd.append('-v')

    if coverage:
        cmd.extend(['--cov=app', '--cov-report=html', '--cov-report=term'])

    # Add test path
    cmd.append('tests/')

    print(f"Running: {' '.join(cmd)}")
    print("=" * 50)

    # Run the tests with the modified environment
    try:
        result = subprocess.run(cmd, env=env, check=True)
        print("\n✅ All tests passed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Tests failed with exit code {e.returncode}")
        return False

def main():
    """Main function to handle command line arguments."""
    verbose = '--verbose' in sys.argv or '-v' in sys.argv
    coverage = '--coverage' in sys.argv or '--cov' in sys.argv

    success = run_tests(verbose=verbose, coverage=coverage)

    if coverage and success:
        print("\n📊 Coverage report generated in htmlcov/index.html")

    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()