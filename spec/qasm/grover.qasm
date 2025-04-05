OPENQASM 3;
def PrepareUniform(inputQubits) {
for q in {inputQubits,} {
h q;

}

}
def ReflectAboutAllOnes(inputQubits) {
cz inputQubits[0..Length(inputQubits, )-2] inputQubits[Length(inputQubits, )-1];

}
