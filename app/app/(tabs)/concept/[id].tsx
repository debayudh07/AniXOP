import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { defiConcepts, generateConceptContent } from '../../services/gemini';

interface ConceptContent {
  title: string;
  explanation: string;
  examples: string[];
  keyTerms: { term: string; definition: string }[];
  risks: string[];
  mitigation: string[];
  simulation: {
    scenario: string;
    steps: string[];
    visualization: string;
  };
}

export default function ConceptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ConceptContent | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'examples' | 'simulation'>('overview');

  const concept = defiConcepts.find((c: typeof defiConcepts[0]) => c.id === id);

  useEffect(() => {
    if (concept) {
      generateConceptContent(concept.title)
        .then((data: ConceptContent) => {
          setContent(data);
          setLoading(false);
        })
        .catch((error: any) => {
          console.error(error);
          setLoading(false);
        });
    }
  }, [id]);

  if (!concept) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text style={{ color: '#ede8dd' }}>Concept not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#3a0000', '#630000', '#1b1717']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b-2" style={{ borderBottomColor: '#c70000' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-xl" style={{ color: '#ede8dd' }}>←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold" style={{ color: '#ede8dd' }}>{concept.emoji} {concept.title}</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#c70000" />
            <Text className="mt-4 text-sm" style={{ color: '#ede8dd' }}>Loading AI content...</Text>
          </View>
        ) : content ? (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-4 py-6">
              {/* Concept Info Cards */}
              <View className="flex-row gap-3 mb-6">
                <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                  <Text className="text-xs mb-1" style={{ color: '#ede8dd', opacity: 0.7 }}>Category</Text>
                  <Text className="text-sm font-bold" style={{ color: '#ede8dd' }}>{concept.category}</Text>
                </View>
                <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                  <Text className="text-xs mb-1" style={{ color: '#ede8dd', opacity: 0.7 }}>Difficulty</Text>
                  <Text className="text-sm font-bold" style={{ color: '#ede8dd' }}>{concept.difficulty}</Text>
                </View>
                <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                  <Text className="text-xs mb-1" style={{ color: '#ede8dd', opacity: 0.7 }}>Duration</Text>
                  <Text className="text-sm font-bold" style={{ color: '#ede8dd' }}>{concept.estimatedTime}</Text>
                </View>
              </View>

              {/* Section Tabs */}
              <View className="flex-row gap-2 mb-6">
                <TouchableOpacity
                  onPress={() => setActiveSection('overview')}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: activeSection === 'overview' ? '#c70000' : '#630000',
                    borderWidth: 1,
                    borderColor: activeSection === 'overview' ? '#ede8dd' : '#c70000'
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveSection('examples')}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: activeSection === 'examples' ? '#c70000' : '#630000',
                    borderWidth: 1,
                    borderColor: activeSection === 'examples' ? '#ede8dd' : '#c70000'
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>Examples</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveSection('simulation')}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    backgroundColor: activeSection === 'simulation' ? '#c70000' : '#630000',
                    borderWidth: 1,
                    borderColor: activeSection === 'simulation' ? '#ede8dd' : '#c70000'
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>Simulation</Text>
                </TouchableOpacity>
              </View>

              {/* Content Sections */}
              {activeSection === 'overview' && (
                <View className="gap-4">
                  <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                    <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>Explanation</Text>
                    <Text className="text-sm leading-6" style={{ color: '#ede8dd', opacity: 0.9 }}>{content.explanation}</Text>
                  </View>

                  {content.keyTerms.length > 0 && (
                    <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                      <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>Key Terms</Text>
                      <View className="gap-3">
                        {content.keyTerms.map((item, index) => (
                          <View key={index}>
                            <Text className="text-sm font-semibold mb-1" style={{ color: '#c70000' }}>{item.term}</Text>
                            <Text className="text-sm" style={{ color: '#ede8dd', opacity: 0.8 }}>{item.definition}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {content.risks.length > 0 && (
                    <View className="rounded-xl p-4" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                      <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>⚠️ Risks</Text>
                      <View className="gap-2">
                        {content.risks.map((risk, index) => (
                          <View key={index} className="flex-row items-start gap-2">
                            <Text style={{ color: '#c70000' }}>•</Text>
                            <Text className="text-sm flex-1" style={{ color: '#ede8dd', opacity: 0.9 }}>{risk}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {content.mitigation.length > 0 && (
                    <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                      <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>🛡️ Mitigation Strategies</Text>
                      <View className="gap-2">
                        {content.mitigation.map((strategy, index) => (
                          <View key={index} className="flex-row items-start gap-2">
                            <Text style={{ color: '#c70000' }}>✓</Text>
                            <Text className="text-sm flex-1" style={{ color: '#ede8dd', opacity: 0.9 }}>{strategy}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {activeSection === 'examples' && (
                <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                  <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>Real-World Examples</Text>
                  <View className="gap-4">
                    {content.examples.map((example, index) => (
                      <View key={index} className="pb-4" style={{ borderBottomWidth: 1, borderBottomColor: '#630000' }}>
                        <View className="flex-row items-start gap-3">
                          <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                            <Text className="text-sm font-bold" style={{ color: '#ede8dd' }}>{index + 1}</Text>
                          </View>
                          <Text className="text-sm flex-1" style={{ color: '#ede8dd', opacity: 0.9 }}>{example}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeSection === 'simulation' && (
                <View className="gap-4">
                  <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                    <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>🤖 AI Simulation</Text>
                    <Text className="text-sm leading-6 mb-4" style={{ color: '#ede8dd', opacity: 0.9 }}>
                      {content.simulation.scenario}
                    </Text>
                    <Text className="text-sm font-semibold mb-2" style={{ color: '#c70000' }}>Steps:</Text>
                    <View className="gap-2">
                      {content.simulation.steps.map((step, index) => (
                        <View key={index} className="flex-row items-start gap-2">
                          <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                            <Text className="text-xs font-bold" style={{ color: '#ede8dd' }}>{index + 1}</Text>
                          </View>
                          <Text className="text-sm flex-1" style={{ color: '#ede8dd', opacity: 0.9 }}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {content.simulation.visualization && (
                    <View className="rounded-xl p-6" style={{ backgroundColor: '#630000', borderWidth: 1, borderColor: '#c70000' }}>
                      <View className="flex-row items-center gap-3 mb-4">
                        <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                          <Text className="text-2xl">📊</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold" style={{ color: '#ede8dd' }}>Interactive Visualization</Text>
                          <Text className="text-xs" style={{ color: '#ede8dd', opacity: 0.7 }}>AI-Generated Demo</Text>
                        </View>
                      </View>
                      
                      <View className="bg-[#3a0000] rounded-lg p-4 mb-3" style={{ borderWidth: 1, borderColor: '#c70000' }}>
                        <Text className="text-sm leading-6" style={{ color: '#ede8dd', opacity: 0.9 }}>{content.simulation.visualization}</Text>
                      </View>
                      
                      <View className="flex-row gap-2">
                        <View className="flex-1 h-20 rounded-lg items-center justify-center" style={{ backgroundColor: '#3a0000', borderWidth: 1, borderColor: '#c70000' }}>
                          <Text className="text-2xl">📈</Text>
                          <Text className="text-xs mt-1" style={{ color: '#ede8dd', opacity: 0.7 }}>Charts</Text>
                        </View>
                        <View className="flex-1 h-20 rounded-lg items-center justify-center" style={{ backgroundColor: '#3a0000', borderWidth: 1, borderColor: '#c70000' }}>
                          <Text className="text-2xl">🎯</Text>
                          <Text className="text-xs mt-1" style={{ color: '#ede8dd', opacity: 0.7 }}>Examples</Text>
                        </View>
                        <View className="flex-1 h-20 rounded-lg items-center justify-center" style={{ backgroundColor: '#3a0000', borderWidth: 1, borderColor: '#c70000' }}>
                          <Text className="text-2xl">💡</Text>
                          <Text className="text-xs mt-1" style={{ color: '#ede8dd', opacity: 0.7 }}>Insights</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    className="rounded-xl p-4 items-center"
                    style={{ backgroundColor: '#c70000', borderWidth: 1, borderColor: '#ede8dd' }}
                    onPress={() => Alert.alert("Simulation", "Interactive simulation coming soon!")}
                  >
                    <Text className="text-base font-semibold" style={{ color: '#ede8dd' }}>Launch Interactive Simulation</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-center" style={{ color: '#ede8dd' }}>Failed to load content. Please try again.</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

