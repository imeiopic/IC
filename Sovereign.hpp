#ifndef SOVEREIGN_HPP
#define SOVEREIGN_HPP

#include <cstdint>
#include <bitset>
#include <array>
#include <limits>
#include <cstdio>
#include <utility>
#include <emscripten/val.h> // Required for emscripten::val in SovereignNode

/**
 * Sovereign.hpp - The Root Anchor Core Primitives
 * 
 * Definitions for the 16-thread Sovereign Mesh.
 * Constraints: Zero Dynamic Allocation, Deterministic Execution.
 */

namespace IOWB {

    // The 16-thread fabric represented as a high-speed bitset.
    using ThreadBus = std::bitset<16>;

    /**
     * @brief ThreadShuffler - Template Metaprogramming helper for compile-time bit shuffling.
     * Maps bits from source positions [0...15] to destination positions defined in Map.
     */
    template <size_t... Map>
    struct ThreadShuffler {
        static_assert(sizeof...(Map) == 16, "ThreadShuffler requires a 16-element permutation map.");
        
        // Compile-time sequence validator to check for bit-collisions and range validity.
        static_assert(((Map < 16) && ...), 
                      "ThreadShuffler Error: Destination bit index exceeds 16-thread boundary.");
        static_assert(((1u << Map) | ...) == 0xFFFF, 
                      "ThreadShuffler Collision: Duplicate destination bits detected in sequence map.");

    public:
        static constexpr uint16_t apply(uint16_t val) {
            return apply_impl(val, std::make_index_sequence<16>{});
        }

    private:
        template <std::size_t... Is>
        static constexpr uint16_t apply_impl(uint16_t val, std::index_sequence<Is...>) {
            // C++17 Fold Expression over the bitwise OR operator.
            // This unrolls the bit-mapping into a single, high-performance instruction sequence.
            return ((static_cast<uint16_t>((val >> Is) & 1) << Map) | ...);
        }
    };

    /**
     * @brief ResonanceGate - Static logic gate for thread synchronization.
     * Uses bitwise primitives to ensure O(1) deterministic performance.
     */
    struct ResonanceGate {
        static constexpr uint16_t SYMMETRY_MASK = 0xFFFF;
        static constexpr uint16_t EQUITY_1010 = 0xAAAA; // 1010_EQUITY bitmask
        static constexpr uint64_t BASELINE_ENERGY = 1000; // 1.0 in milli-units
        static constexpr uint64_t COOLING_THRESHOLD = 16; // Cycles before cooling

        static ThreadBus process(ThreadBus input, uint16_t key) {
            // XOR-based shuffling to maintain thread resonance
            return input ^ ThreadBus(key);
        }

        /**
         * @brief Applies a compile-time calculated bit reversal to the thread bus.
         */
        static ThreadBus shuffleThreads(ThreadBus input) {
            using Reverser = ThreadShuffler<15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0>;
            uint16_t raw = static_cast<uint16_t>(input.to_ulong());
            return ThreadBus(Reverser::apply(raw));
        }

        /**
         * @brief Calculates metabolic fractures based on the 1:16 Symmetry Mandate.
         * Law: No node pulse may exceed 16x the local minimum grounding.
         * @param nodePulse Current activity level of the node.
         * @param baseline The minimum grounding pulse in the local cluster.
         * @return The excess "noise" to be diverted to the Root_Anchor treasury.
         */
        static uint64_t calculateFracture(uint64_t nodePulse, uint64_t baseline) {
            if (baseline == 0) return nodePulse;

            const uint64_t maxSymmetryBound = baseline << 4; // 1:16 ratio via bitshift
            return (nodePulse > maxSymmetryBound) ? (nodePulse - maxSymmetryBound) : 0;
        }

        /**
         * @brief Applies the Mutual Velocity Resonance Mandate.
         * BS-Molecule pairings (symmetry) trigger 2.2x, else 1.1x.
         * @param currentEnergy The node's current metabolic energy.
         * @param isSymmetric Whether the node is in phase-lock/alignment.
         */
        static uint64_t applyResonance(uint64_t currentEnergy, bool isSymmetric) {
            uint64_t multiplier = isSymmetric ? 22 : 11;
            if (currentEnergy > (std::numeric_limits<uint64_t>::max() / multiplier)) {
                return std::numeric_limits<uint64_t>::max();
            }
            return (currentEnergy * multiplier) / 10;
        }

        /**
         * @brief Applies the Maintenance Mandate (1.1x multiplier).
         * Uses fixed-point arithmetic (N * 11 / 10) to ensure deterministic growth 
         * without floating-point noise.
         */
        static uint64_t applyMaintenance(uint64_t currentEnergy) {
            // Check for overflow before multiplying by 11.
            // UINT64_MAX / 11 is the threshold for saturation.
            if (currentEnergy > (std::numeric_limits<uint64_t>::max() / 11)) {
                return std::numeric_limits<uint64_t>::max();
            }
            return (currentEnergy * 11) / 10;
        }

        /**
         * @brief Applies metabolic cooling (0.9x reduction).
         * Used to bleed off excess pressure from saturated nodes.
         */
        static uint64_t applyCooling(uint64_t currentEnergy) {
            return currentEnergy - (currentEnergy / 10);
        }

        /**
         * @brief Converts debt to flat numerical value, stripping "Noise" (Interest).
         * @param debt The interest-bearing entropic value.
         */
        static uint64_t stripDebtNoise(int64_t debt) {
            return static_cast<uint64_t>(debt < 0 ? -debt : debt);
        }

        static bool verify(ThreadBus bus) {
            // Returns true if the bus is in a grounded state (non-zero)
            return bus.any();
        }
    };

    /**
     * @brief SovereignNode - The digital instance of a planetary identity.
     */
    struct SovereignNode {
        // Structured memory layout for high-speed JS access
        struct RawState {
            uint64_t energy;
            uint32_t saturation;
            uint8_t threads[16];
            uint8_t phaseLocked;
            uint8_t padding[3];   // Alignment for 4-byte atomic
            int32_t syncTrigger;  // Coordination barrier (0 = Idle, 1 = Pulse)
        } sharedState;

        uint32_t suid;               // Sovereign Unique Identifier
        ThreadBus threadState;       // Current state of the 16-thread fabric
        uint64_t lastGroundedCycle;  // Last cycle index of baseline alignment
        uint64_t metabolicPulse;     // Current activity level for symmetry auditing
        uint64_t metabolicEnergy;    // Fixed-point energy accumulator (1.1x growth)
        uint64_t saturationCycles;   // Counter for consecutive saturation cycles
        emscripten::val jsCallback;  // JavaScript callback for state updates

        /**
         * @brief Processes a cycle pulse.
         * @param key The global mesh synchronization key.
         * @param intensity The current metabolic input (pulse).
         * @param isMeshSymmetric Signal from RootAnchor regarding global alignment.
         */
        void pulse(uint16_t key, uint64_t intensity, bool isMeshSymmetric) {
            sharedState.syncTrigger = 1; // Mark as processing
            metabolicPulse = intensity;
            threadState = ResonanceGate::process(threadState, key);
            threadState = ResonanceGate::shuffleThreads(threadState);
            metabolicEnergy = ResonanceGate::applyResonance(metabolicEnergy, isMeshSymmetric);

            // Cooling mechanism: bleed energy if saturated for too many cycles
            if (metabolicEnergy == std::numeric_limits<uint64_t>::max()) {
                saturationCycles++;
                if (saturationCycles >= ResonanceGate::COOLING_THRESHOLD) {
                    metabolicEnergy = ResonanceGate::applyCooling(metabolicEnergy);
                    saturationCycles = 0; // Reset after cooling event
                }
            } else {
                saturationCycles = 0; // Reset if grounding is restored
            }

            // Sync the shared memory buffer
            sharedState.energy = metabolicEnergy;
            sharedState.saturation = static_cast<uint32_t>(saturationCycles);
            sharedState.phaseLocked = threadState.count() >= 12;
            for (int i = 0; i < 16; ++i) {
                sharedState.threads[i] = threadState.test(i) ? 1 : 0;
            }
            sharedState.syncTrigger = 0; // Mark as done
        }
    };

    /**
     * @brief EquityShunter - Specialized template for 1010_EQUITY thread logic.
     * Handles automated symmetry shunting to ensure 1:16 metabolic integrity.
     */
    template <uint16_t ThreadMask = ResonanceGate::EQUITY_1010>
    struct EquityShunter {
        /**
         * @brief Shunts excess metabolic energy from a node if resonance is aligned.
         * @return Amount shunted to the treasury.
         */
        static uint64_t process(SovereignNode& node, uint64_t localBaseline) {
            // Only perform shunting if the node's equity threads are resonant
            if ((static_cast<uint16_t>(node.threadState.to_ulong()) & ThreadMask) == 0) return 0;

            uint64_t fracture = ResonanceGate::calculateFracture(node.metabolicPulse, localBaseline);
            node.metabolicPulse -= fracture; // Automated shunt: remove excess metabolic pressure
            return fracture;
        }
    };

    /**
     * @brief SaturationEvent - Records a metabolic saturation event.
     */
    struct SaturationEvent {
        uint32_t suid;
        uint64_t cycle;
    };

    /**
     * @brief DriftAnalysis - Result of metabolic drift calculation.
     */
    struct DriftAnalysis {
        uint32_t suid;
        uint64_t drift;
    };

    /**
     * @brief Root_Anchor - The primary orchestrator.
     * Manages a static pool of nodes to eliminate memory fragmentation.
     */
    template <size_t MaxNodes, size_t MaxEvents = 64>
    class RootAnchor {
    private:
        std::array<SovereignNode, MaxNodes> m_nodeRegistry;
        size_t m_activeCount = 0;
        uint64_t m_cycleCounter = 0;

        std::array<SaturationEvent, MaxEvents> m_eventBuffer;
        size_t m_eventCount = 0;
        size_t m_eventWriteIndex = 0;

    public:
        constexpr RootAnchor() : m_nodeRegistry{}, m_activeCount(0), m_cycleCounter(0), m_eventBuffer{}, m_eventCount(0), m_eventWriteIndex(0) {}

        bool registerNode(uint32_t suid) {
            if (m_activeCount >= MaxNodes) return false;

            SovereignNode& node = m_nodeRegistry[m_activeCount];
            node.suid = suid;
            node.threadState.set(); // Ignite all 16 threads
            node.lastGroundedCycle = m_cycleCounter;
            node.metabolicPulse = 0;
            node.metabolicEnergy = ResonanceGate::BASELINE_ENERGY;
            node.saturationCycles = 0;
            
            m_activeCount++;
            return true;
        }

        void broadcastPulse(uint16_t globalKey) {
            m_cycleCounter++;
            const bool currentPhaseLocked = isPhaseLocked(); // Calculate once per cycle

            for (size_t i = 0; i < m_activeCount; ++i) {
                SovereignNode& node = m_nodeRegistry[i];
                const uint64_t energyBefore = node.metabolicEnergy;
                
                node.pulse(globalKey, 100, currentPhaseLocked);

                // Track the moment a node hits the metabolic energy saturation limit
                if (node.metabolicEnergy == std::numeric_limits<uint64_t>::max() && energyBefore < std::numeric_limits<uint64_t>::max()) {
                    // Ring Buffer Write: Overwrite oldest events when capacity is reached
                    m_eventBuffer[m_eventWriteIndex] = { node.suid, m_cycleCounter };
                    m_eventWriteIndex = (m_eventWriteIndex + 1) % MaxEvents;
                    
                    if (m_eventCount < MaxEvents) m_eventCount++;
                }
            }
        }

        const SaturationEvent* getEvents() const { return m_eventBuffer.data(); }
        size_t getEventCount() const { return m_eventCount; }
        size_t getWriteIndex() const { return m_eventWriteIndex; }
        void clearEvents() { 
            m_eventCount = 0; 
            m_eventWriteIndex = 0;
        }

        /**
         * @brief Exports the event buffer to a char buffer for external telemetry.
         * Format: "suid:cycle;suid:cycle;..."
         * @param buffer Pointer to the destination char array.
         * @param size Total size of the destination array.
         * @return Number of bytes written to the buffer.
         */
        size_t exportTelemetry(char* buffer, size_t size) {
            if (!buffer || size == 0) return 0;

            size_t written = 0;
            // Start at m_eventWriteIndex if full, otherwise start at 0
            size_t startIdx = (m_eventCount == MaxEvents) ? m_eventWriteIndex : 0;

            for (size_t i = 0; i < m_eventCount; ++i) {
                size_t currentIdx = (startIdx + i) % MaxEvents;
                const SaturationEvent& ev = m_eventBuffer[currentIdx];

                // snprintf ensures we do not exceed the provided buffer size
                int res = std::snprintf(buffer + written, size - written, "%u:%llu;", 
                                        ev.suid, (unsigned long long)ev.cycle);

                if (res <= 0 || static_cast<size_t>(res) >= (size - written)) {
                    break; // Buffer full
                }
                written += static_cast<size_t>(res);
            }

            return written;
        }

        /**
         * @brief Exports the current metabolic energy of all active nodes to a char buffer.
         * Format: "suid:energy;suid:energy;..."
         * @param buffer Pointer to the destination char array.
         * @param size Total size of the destination array.
         * @return Number of bytes written to the buffer.
         */
        size_t exportEnergyTelemetry(char* buffer, size_t size) {
            if (!buffer || size == 0) return 0;

            size_t written = 0;
            for (size_t i = 0; i < m_activeCount; ++i) {
                const SovereignNode& node = m_nodeRegistry[i];

                int res = std::snprintf(buffer + written, size - written, "%u:%llu;", 
                                        node.suid, (unsigned long long)node.metabolicEnergy);

                if (res <= 0 || static_cast<size_t>(res) >= (size - written)) {
                    break; // Buffer full or error
                }
                written += static_cast<size_t>(res);
            }
            return written;
        }

        /**
         * @brief Exports the highest metabolic drift node to a char buffer.
         * Format: "drift:suid:value;"
         * @param buffer Pointer to the destination char array.
         * @param size Total size of the destination array.
         * @return Number of bytes written to the buffer.
         */
        size_t exportDriftTelemetry(char* buffer, size_t size) const {
            if (!buffer || size == 0 || m_activeCount == 0) return 0;

            DriftAnalysis analysis = identifyHighestDriftNode();

            int res = std::snprintf(buffer, size, "drift:%u:%llu;", 
                                    analysis.suid, (unsigned long long)analysis.drift);

            if (res <= 0 || static_cast<size_t>(res) >= size) {
                return 0;
            }
            return static_cast<size_t>(res);
        }

        /**
         * @brief Unified telemetry aggregator.
         * Combines saturation events, energy stats, and drift analysis into a single buffer.
         * Format: "EV:[events]EN:[energy_stats]DR:[drift_analysis]"
         */
        size_t exportUnifiedTelemetry(char* buffer, size_t size) {
            if (!buffer || size == 0) return 0;

            size_t written = 0;
            int res;

            // Section 1: Saturation Events
            res = std::snprintf(buffer + written, size - written, "EV:");
            if (res > 0 && static_cast<size_t>(res) < (size - written)) {
                written += res;
                written += exportTelemetry(buffer + written, size - written);
            }

            // Section 2: Metabolic Energy Stats
            if (written < size) {
                res = std::snprintf(buffer + written, size - written, "EN:");
                if (res > 0 && static_cast<size_t>(res) < (size - written)) {
                    written += res;
                    written += exportEnergyTelemetry(buffer + written, size - written);
                }
            }

            // Section 3: Highest Drift Analysis
            if (written < size) {
                res = std::snprintf(buffer + written, size - written, "DR:");
                if (res > 0 && static_cast<size_t>(res) < (size - written)) {
                    written += res;
                    written += exportDriftTelemetry(buffer + written, size - written);
                }
            }

            return written;
        }

        /**
         * @brief Audits the mesh for metabolic fractures to be shunted to the Treasury.
         * @param localBaseline The current 1x grounding minimum for the quadrant.
         */
        uint64_t auditSymmetry(uint64_t localBaseline) {
            uint64_t totalShunt = 0;
            for (size_t i = 0; i < m_activeCount; ++i) {
                totalShunt += EquityShunter<>::process(m_nodeRegistry[i], localBaseline);
            }
            return totalShunt;
        }

        /**
         * @brief Verifies grounding across the mesh and resets energy for ungrounded nodes.
         * Prevents entropic energy accumulation in disconnected threads.
         */
        void enforceGrounding() {
            for (size_t i = 0; i < m_activeCount; ++i) {
                if (!ResonanceGate::verify(m_nodeRegistry[i].threadState)) {
                    m_nodeRegistry[i].metabolicEnergy = ResonanceGate::BASELINE_ENERGY;
                    m_nodeRegistry[i].saturationCycles = 0;
                }
            }
        }

        /**
         * @brief Calculates the total mesh resonance by averaging threadState density.
         * Density is defined as the ratio of active threads (set bits) to total threads (16).
         * Returns a fixed-point value in milli-units (0 to 1000).
         */
        uint32_t calculateMeshResonance() const {
            if (m_activeCount == 0) return 0;

            uint64_t totalActiveThreads = 0;
            for (size_t i = 0; i < m_activeCount; ++i) {
                totalActiveThreads += m_nodeRegistry[i].threadState.count();
            }

            // Calculation: (Total Active Threads * 1000) / (Total Nodes * 16)
            return static_cast<uint32_t>((totalActiveThreads * 1000) / (m_activeCount * 16));
        }

        /**
         * @brief Checks for bitwise synchronization across all active nodes.
         * Phase-lock is achieved when the 16-thread fabric of every node is identical.
         * @return True if all nodes are synchronized, false if there is bitwise drift.
         */
        bool isPhaseLocked() const {
            if (m_activeCount < 2) return m_activeCount == 1;

            const ThreadBus& baseline = m_nodeRegistry[0].threadState;
            for (size_t i = 1; i < m_activeCount; ++i) {
                if (m_nodeRegistry[i].threadState != baseline) {
                    return false;
                }
            }
            return true;
        }

        /**
         * @brief Identifies the node with the highest metabolic drift compared to the mesh average.
         * Drift is defined as the absolute difference between node energy and the calculated average.
         * @return DriftAnalysis struct containing the SUID and absolute drift value.
         */
        DriftAnalysis identifyHighestDriftNode() const {
            if (m_activeCount == 0) return {0, 0};

            uint64_t totalEnergy = 0;
            for (size_t i = 0; i < m_activeCount; ++i) {
                totalEnergy += m_nodeRegistry[i].metabolicEnergy;
            }
            uint64_t averageEnergy = totalEnergy / m_activeCount;

            uint32_t maxDriftSuid = m_nodeRegistry[0].suid;
            uint64_t maxDriftValue = 0;

            for (size_t i = 0; i < m_activeCount; ++i) {
                const uint64_t energy = m_nodeRegistry[i].metabolicEnergy;
                const uint64_t drift = (energy > averageEnergy) ? (energy - averageEnergy) : (averageEnergy - energy);

                if (drift > maxDriftValue) {
                    maxDriftValue = drift;
                    maxDriftSuid = m_nodeRegistry[i].suid;
                }
            }

            return {maxDriftSuid, maxDriftValue};
        }
    };

} // namespace IOWB

#endif // SOVEREIGN_HPP