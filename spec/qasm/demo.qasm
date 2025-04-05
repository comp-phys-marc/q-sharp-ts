OPENQASM 3;
def GroverDiffusion() {
qubit a;
qubit b;
h a;
h b;
z a;
z b;
cz a b;
h a;
h b;

}
def Main() {
qubit[2] register;
//  prepare equal superposition
for qubit q in {register,} {
h q;

}
//  collapse superposition
for qubit q in {register,} {
h q;

}
//  create entanglement
h register[0];
cx register[0] register[1];
//  perform Bell measurement
cx register[0] register[1];
h register[0];
//  Reset
reset register;
//  Single qubit rotations
rx(3.2) register[0];
ry(3.3) register[1];
rz(3.4) register[0];
//  Ising XX 
u3(pi/2, 1.5, 0) register[0];
h register[1];
cx register[0],register[1];
u1(-1.5) register[1];
cx register[0],register[1];
h register[1];
u2(-pi, pi-1.5) register[0];
//  Ising YY
u3(pi/2, 2.3, 0) register[0];
h register[1];
cx register[0],register[1];
u1(-2.3) register[1];
cx register[0],register[1];
h register[1];
u2(-pi, pi-2.3) register[0];
//  Ising ZZ
cx register[0],register[1];
u1(8.5) register[1];
cx register[0],register[1];
//  SWAP
swap register[1],register[0];

}
