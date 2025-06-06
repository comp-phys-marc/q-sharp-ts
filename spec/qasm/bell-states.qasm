OPENQASM 3;
// / # Sample
// / Bell States
// /
// / # Description
// / Bell states or EPR pairs are specific quantum states of two qubits
// / that represent the simplest (and maximal) examples of quantum entanglement.
// /
// / This Q# program implements the four different Bell states.
def PreparePhiPlus(register) {
reset register;
h register[0];
cx register[0] register[1];

}
def PreparePhiMinus(register) {
reset register;
h register[0];
z register[0];
cx register[0] register[1];

}
def PreparePsiPlus(register) {
reset register;
h register[0];
x register[1];
cx register[0] register[1];

}
def PreparePsiMinus(register) {
reset register;
h register[0];
z register[0];
x register[1];
cx register[0] register[1];

}
