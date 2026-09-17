import pytest
from diff import generate_diff

def test_identical_lists():
    list_a = ["a", "b", "c"]
    list_b = ["a", "b", "c"]
    ops = list(generate_diff(list_a, list_b))
    assert ops == [('unchanged', 'a'), ('unchanged', 'b'), ('unchanged', 'c')]

def test_completely_different():
    list_a = ["a", "b"]
    list_b = ["x", "y"]
    ops = list(generate_diff(list_a, list_b))
    assert ops == [('removed', 'a'), ('removed', 'b'), ('added', 'x'), ('added', 'y')]

def test_empty_files():
    list_a = []
    list_b = ["a"]
    ops = list(generate_diff(list_a, list_b))
    assert ops == [('added', 'a')]
    
    list_a = ["a"]
    list_b = []
    ops = list(generate_diff(list_a, list_b))
    assert ops == [('removed', 'a')]
    
    list_a = []
    list_b = []
    ops = list(generate_diff(list_a, list_b))
    assert ops == []

def test_partial_match():
    list_a = ["a", "b", "c", "d"]
    list_b = ["b", "c", "e", "d"]
    ops = list(generate_diff(list_a, list_b))
    assert ops == [
        ('removed', 'a'),
        ('unchanged', 'b'),
        ('unchanged', 'c'),
        ('added', 'e'),
        ('unchanged', 'd')
    ]
