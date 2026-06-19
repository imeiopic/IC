#include <emscripten/bind.h>
#include <emscripten/val.h>
#include "Sovereign.hpp"

using namespace emscripten;
using namespace IOWB;

EMSCRIPTEN_BINDINGS(sovereign_module) {
    // Bind the ThreadBus (std::bitset<16>) type
    class_<ThreadBus>("ThreadBus")
        .function("test", &ThreadBus::test)
        .function("count", &ThreadBus::count)
        .function("size", &ThreadBus::size);

    // Bind the SovereignNode struct
    class_<SovereignNode>("SovereignNode")
        .constructor<>()
        .field("suid", &SovereignNode::suid)
        .field("threadState", &SovereignNode::threadState) // Direct access
        .field("metabolicEnergy", &SovereignNode::metabolicEnergy)
        .field("saturationCycles", &SovereignNode::saturationCycles)
        .field("lastGroundedCycle", &SovereignNode::lastGroundedCycle)
        .function("pulse", &SovereignNode::pulse)
        .function("getStatePtr", optional_override([](const SovereignNode& self) {
            return reinterpret_cast<uintptr_t>(&self.sharedState);
        }));

    // Expose ResonanceGate constants
    constant("BASELINE_ENERGY", ResonanceGate::BASELINE_ENERGY);
    constant("COOLING_THRESHOLD", ResonanceGate::COOLING_THRESHOLD);
}