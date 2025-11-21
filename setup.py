"""
Setup script for the project
Note: This is optional. You can also install dependencies directly using:
    pip install -r requirements.txt
"""

from setuptools import setup, find_packages

setup(
    name="face-recognition-coffeehouse",
    version="1.0.0",
    description="Distributed Face Recognition System for Coffeehouse - CS401V Lab Assignment 2",
    author="CS401V Lab Assignment 2",
    packages=find_packages(exclude=['tests', 'test_images']),
    install_requires=[
        "face-recognition==1.3.0",
        "opencv-python==4.8.1.78",
        "numpy==1.24.3",
        "pymongo==4.6.0",
        "Pillow==10.1.0",
        "python-dotenv==1.0.0",
        "flask==3.0.0",
        "flask-cors==4.0.0",
    ],
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
)

