
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
"use strict";
/**
 * A tree of nodes that can be ASCII visualized.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsciiTree = void 0;
class AsciiTree {
    /**
     * Creates a node.
     * @param text The node's text content
     * @param children Children of this node (can also be added via "add")
     */
    constructor(text, ...children) {
        this.text = text;
        this._children = new Array();
        for (const child of children) {
            this.add(child);
        }
    }
    /**
     * Prints the tree to an output stream.
     */
    printTree(output = process.stdout) {
        let ancestorsPrefix = '';
        for (const parent of this.ancestors) {
            // -1 represents a "hidden" root, and so it's children
            // will all appear as roots (level 0).
            if (parent.level <= 0) {
                continue;
            }
            if (parent.last) {
                ancestorsPrefix += '  ';
            }
            else {
                ancestorsPrefix += ' │';
            }
        }
        let myPrefix = '';
        let multilinePrefix = '';
        if (this.level > 0) {
            if (this.last) {
                if (!this.empty) {
                    myPrefix += ' └─┬ ';
                    multilinePrefix += ' └─┬ ';
                }
                else {
                    myPrefix += ' └── ';
                    multilinePrefix = '     ';
                }
            }
            else {
                if (!this.empty) {
                    myPrefix += ' ├─┬ ';
                    multilinePrefix += ' │ │ ';
                }
                else {
                    myPrefix += ' ├── ';
                    multilinePrefix += ' │   ';
                }
            }
        }
        if (this.text) {
            output.write(ancestorsPrefix);
            output.write(myPrefix);
            const lines = this.text.split('\n');
            output.write(lines[0]);
            output.write('\n');
            for (const line of lines.splice(1)) {
                output.write(ancestorsPrefix);
                output.write(multilinePrefix);
                output.write(line);
                output.write('\n');
            }
        }
        for (const child of this._children) {
            child.printTree(output);
        }
    }
    /**
     * Returns a string representation of the tree.
     */
    toString() {
        let out = '';
        const printer = {
            write: (data) => {
                out += data;
                return true;
            },
        };
        this.printTree(printer);
        return out;
    }
    /**
     * Adds children to the node.
     */
    add(...children) {
        for (const child of children) {
            child.parent = this;
            this._children.push(child);
        }
    }
    /**
     * Returns a copy of the children array.
     */
    get children() {
        return this._children.map((x) => x);
    }
    /**
     * @returns true if this is the root node
     */
    get root() {
        return !this.parent;
    }
    /**
     * @returns true if this is the last child
     */
    get last() {
        if (!this.parent) {
            return true;
        }
        return (this.parent.children.indexOf(this) === this.parent.children.length - 1);
    }
    /**
     * @returns the node level (0 is the root node)
     */
    get level() {
        if (!this.parent) {
            // if the root node does not have text, it will be considered level -1
            // so that all it's children will be roots.
            return this.text ? 0 : -1;
        }
        return this.parent.level + 1;
    }
    /**
     * @returns true if this node does not have any children
     */
    get empty() {
        return this.children.length === 0;
    }
    /**
     * @returns an array of parent nodes (from the root to this node, exclusive)
     */
    get ancestors() {
        if (!this.parent) {
            return [];
        }
        return [...this.parent.ancestors, this.parent];
    }
}
exports.AsciiTree = AsciiTree;
//# sourceMappingURL=ascii-tree.js.map