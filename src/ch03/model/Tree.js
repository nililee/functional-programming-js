/**
 * 간단한 트리 클래스
 * 저자: 루이스 아텐시오
 */

const _ = require('lodash');

class Tree {
    constructor(root) {
        this._root = root;
    }

    static map(node, fn, tree = null) {
        node.value = fn(node.value);
        if(tree === null) {
            tree = new Tree(node);
        }
        if(node.hasChildren()) {
            _.map(node.children, function (child) {
                Tree.map(child, fn, tree);
            });
        }
        return tree;
    }

    get root() {
        return this._root;
    }

    toArray(node = null, arr = []) {
        if(node === null) {
            node = this._root;
        }
        arr.push(node.value);
        // 기저 케이스
        if(node.hasChildren()) {
            var that = this;
            _.map(node.children, function (child) {
                that.toArray(child, arr);
            });
        }
        return arr;
    }
}

exports.Tree = Tree;