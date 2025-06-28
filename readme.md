# Q Sharp TS

Q#, the high-level quantum programming language for quantum circuit specification, implemented in TypeScript.

Language documentation is provided by MicroSoft [here](https://learn.microsoft.com/en-us/azure/quantum/qsharp-overview).

# Usage

Import the parse function or parseString function from the package.

```ts
import { parseFile, parseString } from 'q-sharp-ts';
```

`parseFile` can be called with a file path to a `.qs` file. It will parse the file and return the abstract syntax tree representation.

```ts
let ast = parseFile("<file-path>");
```

`parseString` should be called with a string of Q# code. It will parse the code and return the abstract syntax tree representation. `parseString` also takes the same optional arguments as `parseFile`.

```ts
let ast = parseString("<qs-string>");
```

## Example I/O

###  Q# Operation:

```
operation ReflectAboutMarked(inputQubits : Qubit[]) : Unit {
  use outputQubit = Qubit();
  within {
    // We initialize the outputQubit to (|0> = |1>) / sqrt(2), so that
    // toggling it results in a (=1) phase.
    X(outputQubit);
    H(outputQubit);
    // Flip the outputQubit for marked states.
    // Here, we get the state with alternating 0s and 1s by using the X
    // operation on every other qubit.
    for q in inputQubits [...2...] {
      X(q);
    }
  } apply {
    Controlled X(inputQubits, outputQubit);
  }
}
```

### Parsed Abstract Syntax Tree Segment (we have added comments):

```
// operation
{
    "name": "ReflectAboutMarked",
    "nodes": [
        // qubit allocation
        {
            "name": {
                "repr": "outputQubit",
                "val": "outputQubit"
            },
            "qubits": {
                "repr": "outputQubit",
                "name": "outputQubit",
                "length": {
                    "repr": "1",
                    "val": 1
                }
            }
        },
        // within / apply closure
        {
            "within": [
                // comment
                {
                    "val": " We initialize the outputQubit to (|0> - |1>) / sqrt(2), so that"
                },
                // comment
                {
                    "val": " toggling it results in a (-1) phase."
                },
                // Pauli X gate
                {
                    "target": {
                        "repr": "outputQubit",
                        "id": "outputQubit"
                    }
                },
                // Hadamard gate
                {
                    "target": {
                        "repr": "outputQubit",
                        "id": "outputQubit"
                    }
                },
                // comment
                {
                    "val": " Flip the outputQubit for marked states."
                },
                // comment
                {
                    "val": " Here, we get the state with alternating 0s and 1s by using the X"
                },
                // comment
                {
                    "val": " operation on every other qubit."
                },
                // for loop
                {
                    "variable": {
                        "repr": "q",
                        "name": "q"
                    },
                    "inside": [
                        // Pauli X gate
                        {
                            "target": {
                                "repr": "q",
                                "id": "q"
                            }
                        }
                    ],
                    "vals": {
                        "repr": "inputQubits[...2...]",
                        "vals": [
                            // expression for loop iterable
                            {
                                "repr": "inputQubits[...2...]",
                                "instance": "inputQubits",
                                "index": {
                                    "repr": "...2...",
                                    "lower": {},
                                    "upper": {}
                                }
                            }
                        ],
                        "size": 1
                    }
                }
            ],
            "applies": [
                // controlled X gate
                {
                    "control": {
                        "repr": "inputQubits",
                        "id": "inputQubits"
                    },
                    "target": {
                        "repr": "outputQubit",
                        "id": "outputQubit"
                    }
                }
            ]
        }
    ],
    "params": [
        [
            // input parameter expression
            {
                "repr": "inputQubits",
                "elements": [
                    {
                        "repr": "inputQubits",
                        "id": "inputQubits"
                    }
                ]
            }
        ]
    ],
    // the operation has no modifiers
    "modifiers": [],
    // the operation does not return anything
    "returnType": {}
}
```

To demonstrate how the `Expressions' are parsed, we also include the following example from the same Grover.qs file.

```
function CalculateOptimalIterations(nQubits : Int) : Int {
    if nQubits > 63 {
        fail "This sample supports at most 63 qubits.";
    }
    let nItems = 1 <<< nQubits; // 2^nQubits
    let angle = ArcSin(1. / Sqrt(IntAsDouble(nItems)));
    let iterations = Round(0.25 * PI() / angle - 0.5);
    return iterations;
}
```

Parsed Function:

```
    // function
    {
        "name": "CalculateOptimalIterations",
        "nodes": [
          // if
          {
            "condition": 
            // condition expression
            {
              "repr": "nQubits>63",
              "elements": [
                // qubit identifier
                {
                  "repr": "nQubits",
                  "id": "nQubits"
                },
                // greater than operator
                {
                  "repr": ">"
                },
                // integer literal
                {
                  "repr": "63",
                  "val": 63
                }
              ]
            },
            "ifClause": [
                // fail statement
              {
                "msg": {
                  "repr": [
                    51,
                    "\"This sample supports at most 63 qubits.\""
                  ],
                  "val": [
                    51,
                    "\"This sample supports at most 63 qubits.\""
                  ]
                }
              }
            ]
          },
          // let variable declaration and assignment
          {
            "expression": 
            // right hand side expression
            {
              "repr": "1<<<nQubits",
              "elements": [
                // literal
                {
                  "repr": "1",
                  "val": 1
                },
                // bitwise operator
                {
                  "repr": "<<<"
                },
                // qubit identifier
                {
                  "repr": "nQubits",
                  "id": "nQubits"
                }
              ]
            },
            "variable": {
              "repr": "nItems",
              "name": "nItems"
            }
          },
          // let variable declaration and assignment
          {
            "expression": 
            // right hand side expression
            {
              "repr": "ArcSin(1/Sqrt(IntAsDouble(nItems, ), ), )",
              "elements": [
                // ArcSin function call
                {
                  "repr": "ArcSin(1/Sqrt(IntAsDouble(nItems, ), ), )",
                  "name": "ArcSin",
                  "params": [
                    [
                      // ArcSin parameter expression
                      {
                        "repr": "1/Sqrt(IntAsDouble(nItems, ), )",
                        "elements": [
                          // Double literal
                          {
                            "repr": "1",
                            "val": 1
                          },
                          // divide by operator
                          {
                            "repr": "/"
                          },
                          // Sqrt function call
                          {
                            "repr": "Sqrt(IntAsDouble(nItems, ), )",
                            "name": "Sqrt",
                            "params": [
                              [
                                // Sqrt function parameter expression
                                {
                                  "repr": "IntAsDouble(nItems, )",
                                  "elements": [
                                    //  IntAsDouble function call
                                    {
                                      "repr": "IntAsDouble(nItems, )",
                                      "name": "IntAsDouble",
                                      "params": [
                                        [
                                          // IntAsDouble function param expression
                                          {
                                            "repr": "nItems",
                                            "elements": [
                                              // variable reference
                                              {
                                                "repr": "nItems",
                                                "name": "nItems"
                                              }
                                            ]
                                          }
                                        ]
                                      ]
                                    }
                                  ]
                                }
                              ]
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }
              ]
            },
            "variable": {
              "repr": "angle",
              "name": "angle"
            }
          },
          {
            "expression": 
            // let variable declaration and assignment
            {
              "repr": "Round(0.25*PI()/angle-0.5, )",
              "elements": [
                // right hand side expression
                {
                  "repr": "Round(0.25*PI()/angle-0.5, )",
                  "name": "Round",
                  "params": [
                    [
                      // Round function parameter expression
                      {
                        "repr": "0.25*PI()/angle-0.5",
                        "elements": [
                          // Double literal
                          {
                            "repr": "0.25",
                            "val": 0.25
                          },
                          // multiplier operator
                          {
                            "repr": "*"
                          },
                          // PI function call
                          {
                            "repr": "PI()",
                            "name": "PI",
                            "params": []
                          },
                          // divide operator
                          {
                            "repr": "/"
                          },
                          // variable reference
                          {
                            "repr": "angle",
                            "name": "angle"
                          },
                          // minus operator
                          {
                            "repr": "-"
                          },
                          // Double literal
                          {
                            "repr": "0.5",
                            "val": 0.5
                          }
                        ]
                      }
                    ]
                  ]
                }
              ]
            },
            "variable": {
              "repr": "iterations",
              "name": "iterations"
            }
          },
          // return statement 
          {
            "expr": {
              "repr": "iterations",
              "elements": [
                // return statement expression
                {
                  "repr": "iterations",
                  "name": "iterations"
                }
              ]
            }
          }
        ],
        "params": [
          [
            // function parameters expression
            {
              "repr": "nQubits",
              "elements": [
                {
                  "repr": "nQubits",
                  "id": "nQubits"
                }
              ]
            }
          ]
        ]
      }
```

## Transpiling

```
tsc src/*.ts --outDir dist
```

## Installing dependencies

```
npm install
```

## Source code

Feel free to clone, fork, comment or contribute on [GitHub](https://github.com/comp-phys-marc/q-sharp-ts)!
