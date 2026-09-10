"""
Tests for the Trie implementation.
"""

import pytest
from ..trie import Trie

def test_basic_insert_and_search():
    trie = Trie()
    trie.insert("apple")
    
    assert trie.search("apple") is True
    assert trie.search("app") is False
    assert trie.starts_with("app") is True

def test_autocomplete():
    trie = Trie()
    trie.insert("app", 10)
    trie.insert("apple", 20)
    trie.insert("application", 5)
    trie.insert("apt", 15)
    trie.insert("banana", 30)
    
    # Prefix 'app'
    suggestions = trie.autocomplete("app")
    # Expected: sorted by frequency descending
    assert suggestions == ["apple", "app", "application"]
    
    # Prefix 'ap'
    suggestions = trie.autocomplete("ap")
    assert suggestions == ["apple", "apt", "app", "application"]
    
    # Non-existent prefix
    assert trie.autocomplete("xyz") == []
    
    # Prefix 'b'
    assert trie.autocomplete("b") == ["banana"]

def test_autocomplete_same_frequency():
    trie = Trie()
    trie.insert("cat", 10)
    trie.insert("car", 10)
    trie.insert("cab", 10)
    
    # If frequencies are the same, should sort alphabetically
    suggestions = trie.autocomplete("ca")
    assert suggestions == ["cab", "car", "cat"]

def test_delete():
    trie = Trie()
    trie.insert("apple")
    trie.insert("app")
    
    assert trie.search("apple") is True
    assert trie.search("app") is True
    
    # Delete 'apple'
    assert trie.delete("apple") is True
    assert trie.search("apple") is False
    assert trie.search("app") is True
    assert trie.starts_with("app") is True
    
    # Try to delete non-existent word
    assert trie.delete("appl") is False
    
    # Delete 'app'
    assert trie.delete("app") is True
    assert trie.search("app") is False
    # After deleting 'app', there should be no words starting with 'app'
    assert trie.starts_with("app") is False
    
def test_delete_shared_prefix():
    trie = Trie()
    trie.insert("bat")
    trie.insert("bath")
    
    assert trie.delete("bat") is True
    assert trie.search("bat") is False
    assert trie.search("bath") is True
