import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { defiConcepts } from '../services/gemini';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.2:3000';

interface ConceptContent {
  title: string;
  explanation: string[];
  examples: string[];
  quiz: any[];
  interactive: any;
  keyTerms: { term: string; definition: string }[];
  risks: string[];
  mitigation: string[];
  simulation?: {
    scenario: string;
    steps: string[];
    onChain?: {
      transactionHash: string;
      reserves: { reserveA: string; reserveB: string; price: string };
      results: any;
      aiExplanation: string;
    };
  };
}

export default function ConceptDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [content, setContent] = useState<ConceptContent | null>(null);
  const [lessonStatus, setLessonStatus] = useState<string>('not_started');
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<'overview' | 'examples' | 'simulation'>('overview');
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const concept = defiConcepts.find((c: typeof defiConcepts[0]) => c.id === id);

  useEffect(() => {
    if (concept && token) {
      fetchContent();
    } else if (concept) {
      setLoading(false);
      Alert.alert('Login Required', 'Please login to view lessons');
    }
  }, [id, token]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/defi/concept/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.data);
        setLessonStatus(data.status || 'in_progress');
        setProgress(data.progress || 0);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!content || !id) return;
    
    setSimulating(true);
    try {
      // Map concept IDs to appropriate simulation types
      const simulationConfig: Record<string, { type: string; params: any }> = {
        'amm': { 
          type: 'amm', 
          params: { amountIn: '1', isTokenA: true } 
        },
        'lppools': { 
          type: 'liquidity', 
          params: { amountA: '10', amountB: '20' } 
        },
        'snipping': { 
          type: 'sniping', 
          params: { amount: '0.5' } 
        }
      };
      
      const config = simulationConfig[id] || simulationConfig['amm'];
      
      // Call the simulator API
      const endpoint = config.type === 'amm' ? '/simulate-amm' : 
                      config.type === 'liquidity' ? '/add-liquidity' : 
                      '/simulate-sniping';
      
      const response = await fetch(`${API_BASE_URL}/api/simulator${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config.params),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Get updated reserves
        const reservesResponse = await fetch(`${API_BASE_URL}/api/simulator/reserves`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        let reserves = null;
        if (reservesResponse.ok) {
          const reservesData = await reservesResponse.json();
          reserves = reservesData.data;
        }
        
        // Synthesize results with AI
        let synthesizeData = null;
        try {
          const synthesizeResponse = await fetch(`${API_BASE_URL}/api/synthesize/synthesize-results`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              concept: concept?.title,
              transactionData: result.data,
              reserves: reserves,
              results: result.data
            }),
          });
          
          if (synthesizeResponse.ok) {
            const data = await synthesizeResponse.json();
            synthesizeData = data.data;
          }
        } catch (synthesizeError) {
          console.error('Error synthesizing:', synthesizeError);
        }
        
        const aiExplanation = synthesizeData?.explanation || '✅ Transaction completed successfully!';
        
        setSimulationResults({
          success: true,
          transactionHash: result.data.transactionHash,
          reserves: reserves,
          events: result.data.events || [],
          aiExplanation: aiExplanation,
          aiData: synthesizeData,
        });
        
        // Update content with simulation results
        if (content) {
          const updatedSimulation = {
            ...content.simulation,
            onChain: {
              transactionHash: result.data.transactionHash,
              reserves: reserves || { reserveA: '0', reserveB: '0', price: '0' },
              results: result.data,
              aiExplanation: aiExplanation,
            }
          };
          setContent({ ...content, simulation: updatedSimulation as any });
        }
        
        Alert.alert('✅ Simulation Complete!', 'Check Etherscan for transaction details');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to run simulation');
      }
    } catch (error: any) {
      console.error('Error running simulation:', error);
      Alert.alert('Error', error.message || 'Failed to run simulation');
    } finally {
      setSimulating(false);
    }
  };

  const handleRestartLesson = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-lesson/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('✅ Lesson Restarted', 'This lesson has been reset. Refresh the page to see it as new.', [
          { 
            text: 'OK', 
            onPress: () => {
              // Reload the content
              setLoading(true);
              setLessonStatus('not_started');
              setProgress(0);
              setSimulationResults(null);
              fetchContent();
            }
          }
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to restart lesson');
      }
    } catch (error) {
      console.error('Error restarting lesson:', error);
      Alert.alert('Error', 'Failed to restart lesson');
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/defi/concept/${id}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeSpent: 15, // Estimate
          quizScore: 85
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh user profile to get updated stats
        await refreshProfile();
        
        Alert.alert('🎉 Lesson Completed!', `Great job! You've completed ${data.data?.totalConceptsCompleted || 0} lessons!`, [
          { 
            text: 'OK', 
            onPress: () => {
              setLessonStatus('completed');
              setProgress(100);
              router.back();
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

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
          <>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-4 py-6">
                {/* Progress Bar */}
                {lessonStatus !== 'completed' && (
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-semibold" style={{ color: '#ede8dd' }}>Progress</Text>
                      <Text className="text-sm" style={{ color: '#ede8dd', opacity: 0.7 }}>{progress}%</Text>
                    </View>
                    <View className="w-full h-2 rounded-full" style={{ backgroundColor: '#630000' }}>
                      <View 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: '#c70000'
                        }}
                      />
                    </View>
                  </View>
                )}

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
                      {content.explanation.map((para: string, i: number) => (
                        <Text key={i} className="text-sm leading-6 mb-3" style={{ color: '#ede8dd', opacity: 0.9 }}>{para}</Text>
                      ))}
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

                {activeSection === 'examples' && content.examples && content.examples.length > 0 && (
                  <View className="gap-4">
                    <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                      <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>📚 Examples</Text>
                      <View className="gap-3">
                        {content.examples.map((example: string, index: number) => (
                          <View key={index} className="rounded-lg p-3" style={{ backgroundColor: '#630000' }}>
                            <Text className="text-sm leading-5" style={{ color: '#ede8dd', opacity: 0.9 }}>
                              {example}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {activeSection === 'simulation' && (
                  <View className="gap-4">
                    {content.interactive && (
                      <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                        <Text className="text-base font-semibold mb-3" style={{ color: '#ede8dd' }}>🤖 AI Interactive</Text>
                        <Text className="text-sm leading-6 mb-4" style={{ color: '#ede8dd', opacity: 0.9 }}>
                          {content.interactive.description}
                        </Text>
                        {content.interactive.steps && content.interactive.steps.length > 0 && (
                          <>
                            <Text className="text-sm font-semibold mb-2" style={{ color: '#c70000' }}>Steps:</Text>
                            <View className="gap-2">
                              {content.interactive.steps.map((step: string, index: number) => (
                                <View key={index} className="flex-row items-start gap-2">
                                  <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: '#c70000' }}>
                                    <Text className="text-xs font-bold" style={{ color: '#ede8dd' }}>{index + 1}</Text>
                                  </View>
                                  <Text className="text-sm flex-1" style={{ color: '#ede8dd', opacity: 0.9 }}>{step}</Text>
                                </View>
                              ))}
                            </View>
                          </>
                        )}
                      </View>
                    )}
                    
                    {/* Blockchain Simulation - Show for AMM, Liquidity Pools, and Token Sniping */}
                    {(['amm', 'lppools', 'snipping'].includes(id)) && (
                      <View className="rounded-xl p-4" style={{ backgroundColor: '#1b1717', borderWidth: 1, borderColor: '#c70000' }}>
                        <View className="flex-row items-center justify-between mb-3">
                          <Text className="text-base font-semibold" style={{ color: '#ede8dd' }}>⛓️ On-Chain Simulation</Text>
                          <TouchableOpacity
                            onPress={handleSimulate}
                            disabled={simulating}
                            className="px-4 py-2 rounded-lg"
                            style={{ backgroundColor: '#c70000', borderWidth: 1, borderColor: '#ede8dd' }}
                          >
                            {simulating ? (
                              <ActivityIndicator color="#ede8dd" size="small" />
                            ) : (
                              <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>
                                Run Simulation
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                        
                        <Text className="text-sm mb-3" style={{ color: '#ede8dd', opacity: 0.8 }}>
                          Run this simulation on the Sepolia testnet to see real DeFi mechanics in action.
                        </Text>
                        
                        {simulationResults && (
                          <View className="mt-3 gap-3">
                            <View className="rounded-lg p-3" style={{ backgroundColor: '#630000' }}>
                              <Text className="text-xs font-semibold mb-1" style={{ color: '#c70000' }}>Transaction Hash:</Text>
                              <Text className="text-xs font-mono" style={{ color: '#ede8dd' }}>
                                {simulationResults.transactionHash}
                              </Text>
                            </View>
                            
                            {simulationResults.reserves && (
                              <View className="rounded-lg p-3" style={{ backgroundColor: '#630000' }}>
                                <Text className="text-xs font-semibold mb-2" style={{ color: '#c70000' }}>Updated Reserves:</Text>
                                <Text className="text-xs mb-1" style={{ color: '#ede8dd' }}>
                                  Token A: {simulationResults.reserves.reserveA}
                                </Text>
                                <Text className="text-xs mb-1" style={{ color: '#ede8dd' }}>
                                  Token B: {simulationResults.reserves.reserveB}
                                </Text>
                                <Text className="text-xs" style={{ color: '#ede8dd' }}>
                                  Price: {simulationResults.reserves.price} TokenB/TokenA
                                </Text>
                              </View>
                            )}
                            
                            {simulationResults.aiExplanation && (
                              <View className="rounded-lg p-3" style={{ backgroundColor: '#1b1717' }}>
                                <Text className="text-xs font-semibold mb-2" style={{ color: '#c70000' }}>🤖 AI Analysis:</Text>
                                <Text className="text-xs leading-4 mb-2" style={{ color: '#ede8dd', opacity: 0.9 }}>
                                  {simulationResults.aiExplanation}
                                </Text>
                                
                                {simulationResults.aiData?.summary && (
                                  <View className="mt-2 pt-2 border-t" style={{ borderTopColor: '#c70000' }}>
                                    <Text className="text-xs font-semibold mb-1" style={{ color: '#c70000' }}>📊 Summary:</Text>
                                    <Text className="text-xs leading-4" style={{ color: '#ede8dd', opacity: 0.9 }}>
                                      {simulationResults.aiData.summary}
                                    </Text>
                                  </View>
                                )}
                                
                                {simulationResults.aiData?.keyMetrics && simulationResults.aiData.keyMetrics.length > 0 && (
                                  <View className="mt-2">
                                    <Text className="text-xs font-semibold mb-1" style={{ color: '#c70000' }}>📈 Key Metrics:</Text>
                                    {simulationResults.aiData.keyMetrics.map((metric: string, idx: number) => (
                                      <Text key={idx} className="text-xs leading-3 mb-1" style={{ color: '#ede8dd', opacity: 0.8 }}>
                                        • {metric}
                                      </Text>
                                    ))}
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="px-4 py-4 border-t-2" style={{ borderTopColor: '#c70000' }}>
              <View className="flex-row gap-3">
                {lessonStatus !== 'completed' ? (
                  <>
                    <TouchableOpacity
                      onPress={handleCompleteLesson}
                      disabled={completing}
                      className="flex-1 rounded-xl p-4 items-center"
                      style={{ backgroundColor: '#c70000', borderWidth: 1, borderColor: '#ede8dd' }}
                    >
                      {completing ? (
                        <ActivityIndicator color="#ede8dd" />
                      ) : (
                        <Text className="text-base font-semibold" style={{ color: '#ede8dd' }}>
                          ✓ Mark as Completed
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    {(lessonStatus === 'in_progress') && (
                      <TouchableOpacity
                        onPress={handleRestartLesson}
                        className="rounded-xl px-4 py-4 items-center justify-center"
                        style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c70000' }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>
                          🔄
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      className="flex-1 rounded-xl p-4 items-center"
                      style={{ backgroundColor: '#c70000', borderWidth: 1, borderColor: '#ede8dd' }}
                    >
                      <Text className="text-base font-semibold" style={{ color: '#ede8dd' }}>
                        ← Back to Learn
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleRestartLesson}
                      className="rounded-xl px-4 py-4 items-center justify-center"
                      style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#c70000' }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: '#ede8dd' }}>
                        🔄
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </>
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-center" style={{ color: '#ede8dd' }}>Please login to view this lesson.</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

