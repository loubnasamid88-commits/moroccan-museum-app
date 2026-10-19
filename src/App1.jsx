import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [contrast, setContrast] = useState(1.0);
  const [currentImage, setCurrentImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [selectedHotspotPosition, setSelectedHotspotPosition] = useState(null);
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newSceneImage, setNewSceneImage] = useState('');
  const [showGuideMenu, setShowGuideMenu] = useState(false);
  const [showAddGuideModal, setShowAddGuideModal] = useState(false);
  const [newGuideTitle, setNewGuideTitle] = useState('');
  const [newGuideTargetId, setNewGuideTargetId] = useState('');
  const [activeInfoPanel, setActiveInfoPanel] = useState(null);
  const [scenes, setScenes] = useState([]);
  
  const panoramaRef = useRef(null);
  const viewerRef = useRef(null);
  const canvasRef = useRef(null);

  // Load default scenes
  useEffect(() => {
    const defaultScenes = [
      {
        id: "scene1",
        title: "🏛️ Museum Hall",
        image: "https://raw.githubusercontent.com/mpetroff/pannellum-demo/master/example-images/museum.jpg",
        defaultView: { pitch: 10, yaw: -30 },
        showInGuide: true,
        infoContent: "The Museum Hall features ancient Moroccan artifacts from the 12th century, including pottery, textiles, and historical manuscripts.",
        guides: [
          { title: "🌿 Go to Courtyard", targetSceneId: "scene2", infoContent: "The Moroccan Courtyard features a traditional fountain and beautiful gardens." },
          { title: "🕌 Explore Palace", targetSceneId: "scene3", infoContent: "The Palace Interior showcases royal throne rooms and stunning architecture." }
        ],
        hotspots: [
          {
            id: 1,
            pitch: 0,
            yaw: 45,
            type: "info",
            text: "Ancient Moroccan artifacts from the 12th century"
          }
        ]
      },
      {
        id: "scene2",
        title: "🌿 Moroccan Courtyard",
        image: "https://raw.githubusercontent.com/mpetroff/pannellum-demo/master/example-images/ceremony.jpg",
        defaultView: { pitch: -10, yaw: 90 },
        showInGuide: true,
        infoContent: "The Moroccan Courtyard features a traditional fountain, intricate tilework, and lush gardens. This was the center of social life in traditional Moroccan architecture.",
        guides: [
          { title: "🏛️ Back to Museum", targetSceneId: "scene1", infoContent: "Return to the main Museum Hall with ancient artifacts." },
          { title: "🕌 Palace Interior", targetSceneId: "scene3", infoContent: "Enter the Palace Interior to see royal chambers and throne rooms." }
        ],
        hotspots: [
          {
            id: 2,
            pitch: -10,
            yaw: 90,
            type: "info",
            text: "Traditional Moroccan fountain and gardens"
          }
        ]
      },
      {
        id: "scene3",
        title: "🕌 Palace Interior",
        image: "https://raw.githubusercontent.com/mpetroff/pannellum-demo/master/example-images/palacio.jpg",
        defaultView: { pitch: 0, yaw: 0 },
        showInGuide: true,
        infoContent: "The Palace Interior displays royal throne rooms, intricate zellij tilework, carved cedar wood, and stunning architectural details from the 16th century.",
        guides: [
          { title: "🌿 Back to Courtyard", targetSceneId: "scene2", infoContent: "Return to the beautiful Moroccan Courtyard." }
        ],
        hotspots: [
          {
            id: 3,
            pitch: 0,
            yaw: 0,
            type: "info",
            text: "Royal throne room with stunning architecture"
          }
        ]
      }
    ];
    
    const savedScenes = localStorage.getItem('scenes');
    if (savedScenes) {
      const parsedScenes = JSON.parse(savedScenes);
      setScenes(parsedScenes);
      setSelectedSceneId(parsedScenes[0]?.id || null);
    } else {
      setScenes(defaultScenes);
      setSelectedSceneId(defaultScenes[0].id);
    }
  }, []);

  // Helper to get current scene
  const currentScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];
  
  // Filter scenes that should appear in guide
  const guideScenes = scenes.filter(scene => scene.showInGuide === true);

  // Save scenes to localStorage
  const saveScenesToJSON = (updatedScenes) => {
    setScenes(updatedScenes);
    localStorage.setItem('scenes', JSON.stringify(updatedScenes));
    console.log("Scenes saved:", updatedScenes);
  };

  // Load Pannellum script
  useEffect(() => {
    const loadPannellum = async () => {
      return new Promise((resolve) => {
        if (window.pannellum) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    loadPannellum();
  }, []);

  // Initialize or update viewer with hotspots
  useEffect(() => {
    if (!window.pannellum || !panoramaRef.current || !currentScene) return;

    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    setIsLoading(true);

    const visibleHotspots = currentScene.hotspots ? currentScene.hotspots.filter(hotspot => 
      hotspot.type === 'info' || hotspot.type === 'navigation'
    ) : [];

    const hotspotsConfig = visibleHotspots.map(hotspot => {
      const isNavigation = hotspot.type === 'navigation';
      
      return {
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: "info",
        text: hotspot.text,
        cssClass: `custom-hotspot ${hotspot.type}-hotspot`,
        createTooltipFunc: (hotspotDiv, args) => {
          const tooltip = document.createElement('div');
          tooltip.className = `hotspot-tooltip`;
          
          if (isNavigation) {
            tooltip.innerHTML = `
              <div class="tooltip-content">
                <strong>🚪 ${hotspot.text}</strong>
                <button class="navigate-btn">Navigate</button>
              </div>
            `;
          } else {
            tooltip.innerHTML = `
              <div class="tooltip-content info-tooltip">
                <strong>ℹ️ Info</strong>
                <p>${hotspot.text}</p>
              </div>
            `;
          }
          
          const btn = tooltip.querySelector('.navigate-btn');
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              const targetScene = scenes.find(s => s.id === hotspot.targetSceneId);
              if (targetScene) {
                changeScene(targetScene.id);
              }
            };
          }
          
          hotspotDiv.appendChild(tooltip);
        },
        clickHandlerFunc: (e) => {
          if (editMode) {
            e.stopPropagation();
            if (confirm(`Delete ${hotspot.type} hotspot: ${hotspot.text}?`)) {
              const updatedScenes = scenes.map(scene => {
                if (scene.id === currentScene.id) {
                  return {
                    ...scene,
                    hotspots: scene.hotspots.filter(h => h.id !== hotspot.id)
                  };
                }
                return scene;
              });
              saveScenesToJSON(updatedScenes);
            }
          } else if (isNavigation && !editMode) {
            const targetScene = scenes.find(s => s.id === hotspot.targetSceneId);
            if (targetScene) {
              changeScene(targetScene.id);
            }
          }
        }
      };
    });

    try {
      const viewer = window.pannellum.viewer(panoramaRef.current, {
        type: "equirectangular",
        panorama: currentScene.image,
        autoLoad: true,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        compass: true,
        hfov: 100,
        minHfov: 60,
        maxHfov: 120,
        yaw: currentScene.defaultView?.yaw || 0,
        pitch: currentScene.defaultView?.pitch || 0,
        orientationOnByDefault: true,
        mouseZoom: true,
        draggable: true,
        keyboardZoom: true,
        showControls: true,
        hotSpots: hotspotsConfig
      });

      viewerRef.current = viewer;

      if (editMode && panoramaRef.current) {
        const handleCanvasClick = (e) => {
          if (!editMode) return;
          
          const yaw = viewer.getYaw();
          const pitch = viewer.getPitch();
          
          setSelectedHotspotPosition({ yaw, pitch });
          setShowHotspotModal(true);
        };
        
        panoramaRef.current.addEventListener('click', handleCanvasClick);
        return () => {
          panoramaRef.current?.removeEventListener('click', handleCanvasClick);
        };
      }

      viewer.on('load', () => {
        setIsLoading(false);
        
        if (currentScene.defaultView) {
          setTimeout(() => {
            if (viewerRef.current) {
              viewerRef.current.lookAt(
                currentScene.defaultView.pitch,
                currentScene.defaultView.yaw,
                1000
              );
            }
          }, 500);
        }
        
        setTimeout(() => {
          const canvas = panoramaRef.current?.querySelector('canvas');
          if (canvas) {
            canvasRef.current = canvas;
            canvas.style.filter = `contrast(${contrast})`;
            canvas.style.transition = 'filter 0.1s ease';
          }
        }, 100);
      });
    } catch (error) {
      console.error("Error creating viewer:", error);
      setIsLoading(false);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [currentScene, editMode, scenes]);

  // Apply contrast filter
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.filter = `contrast(${contrast})`;
    }
  }, [contrast]);

  // Change scene
  const changeScene = (sceneId) => {
    setSelectedSceneId(sceneId);
    setCurrentImage(null);
    setShowGuideMenu(false);
    setActiveInfoPanel(null);
  };

  // Handle guide click with info panel
  const handleGuideClick = (guide) => {
    if (activeInfoPanel === guide.title) {
      setActiveInfoPanel(null);
    } else {
      setActiveInfoPanel(guide.title);
    }
  };

  // Add new guide to current scene
  const addGuideToCurrentScene = () => {
    if (!newGuideTitle || !newGuideTargetId) {
      alert("Please fill in both title and target scene");
      return;
    }
    
    const updatedScenes = scenes.map(scene => {
      if (scene.id === currentScene.id) {
        return {
          ...scene,
          guides: [...(scene.guides || []), {
            title: newGuideTitle,
            targetSceneId: newGuideTargetId,
            infoContent: `Information about ${newGuideTitle}`
          }]
        };
      }
      return scene;
    });
    saveScenesToJSON(updatedScenes);
    setShowAddGuideModal(false);
    setNewGuideTitle('');
    setNewGuideTargetId('');
    alert(`Guide "${newGuideTitle}" added to ${currentScene.title}!`);
  };

  // Delete guide from current scene
  const deleteGuideFromScene = (guideIndex) => {
    if (confirm("Delete this guide?")) {
      const updatedScenes = scenes.map(scene => {
        if (scene.id === currentScene.id) {
          const newGuides = [...(scene.guides || [])];
          newGuides.splice(guideIndex, 1);
          return {
            ...scene,
            guides: newGuides
          };
        }
        return scene;
      });
      saveScenesToJSON(updatedScenes);
      if (activeInfoPanel === currentScene.guides[guideIndex]?.title) {
        setActiveInfoPanel(null);
      }
    }
  };

  // Add new hotspot
  const addHotspot = (type, text, targetSceneId = null) => {
    if (!selectedHotspotPosition) return;
    
    const newHotspot = {
      id: Date.now(),
      pitch: selectedHotspotPosition.pitch,
      yaw: selectedHotspotPosition.yaw,
      type: type,
      text: text
    };
    
    if (type === 'navigation') {
      if (targetSceneId) {
        newHotspot.targetSceneId = targetSceneId;
      }
    }
    
    const updatedScenes = scenes.map(scene => {
      if (scene.id === currentScene.id) {
        return {
          ...scene,
          hotspots: [...(scene.hotspots || []), newHotspot]
        };
      }
      return scene;
    });
    
    saveScenesToJSON(updatedScenes);
    setShowHotspotModal(false);
    setSelectedHotspotPosition(null);
  };

  // Add new scene
  const addNewScene = () => {
    if (newSceneTitle && newSceneImage) {
      const newScene = {
        id: `scene_${Date.now()}`,
        title: newSceneTitle,
        image: newSceneImage,
        defaultView: { pitch: 0, yaw: 0 },
        showInGuide: true,
        infoContent: `Explore ${newSceneTitle}`,
        guides: [],
        hotspots: []
      };
      const updatedScenes = [...scenes, newScene];
      saveScenesToJSON(updatedScenes);
      setShowAddSceneModal(false);
      setNewSceneTitle('');
      setNewSceneImage('');
      setSelectedSceneId(newScene.id);
    }
  };

  // Toggle showInGuide for a scene
  const toggleShowInGuide = (sceneId) => {
    const updatedScenes = scenes.map(scene => {
      if (scene.id === sceneId) {
        return {
          ...scene,
          showInGuide: !scene.showInGuide
        };
      }
      return scene;
    });
    saveScenesToJSON(updatedScenes);
  };

  // Delete scene
  const deleteScene = (sceneId) => {
    if (scenes.length <= 1) {
      alert("Cannot delete the last scene!");
      return;
    }
    
    const updatedScenes = scenes.filter(s => s.id !== sceneId);
    saveScenesToJSON(updatedScenes);
    
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(updatedScenes[0].id);
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (editMode) {
          const updatedScenes = scenes.map(scene => {
            if (scene.id === currentScene.id) {
              return { ...scene, image: e.target.result };
            }
            return scene;
          });
          saveScenesToJSON(updatedScenes);
        } else {
          setCurrentImage(e.target.result);
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (editMode) {
          const updatedScenes = scenes.map(scene => {
            if (scene.id === currentScene.id) {
              return { ...scene, image: event.target.result };
            }
            return scene;
          });
          saveScenesToJSON(updatedScenes);
        } else {
          setCurrentImage(event.target.result);
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset view
  const resetView = () => {
    if (viewerRef.current && currentScene.defaultView) {
      viewerRef.current.lookAt(
        currentScene.defaultView.pitch,
        currentScene.defaultView.yaw,
        1000
      );
    } else if (viewerRef.current) {
      viewerRef.current.setYaw(0);
      viewerRef.current.setPitch(0);
      viewerRef.current.setHfov(100);
    }
  };

  // Toggle fullscreen with fixed hfov
  const toggleFullscreen = () => {
    const elem = panoramaRef.current;
    if (elem?.requestFullscreen) {
      elem.requestFullscreen();
      setTimeout(() => {
        if (viewerRef.current) {
          viewerRef.current.setHfov(100);
        }
      }, 100);
    }
  };

  // Reset contrast
  const resetContrast = () => {
    setContrast(1.0);
  };

  const handleContrastChange = (e) => {
    setContrast(parseFloat(e.target.value));
  };

  if (!currentScene) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #5C3A21 0%, #3A2417 100%)',
        fontFamily: "'Segoe UI', 'Poppins', system-ui, sans-serif",
        display: 'flex'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '60px',
            background: '#C49A6C',
            padding: '30px',
            borderRadius: '50%'
          }}>📷</div>
          <p style={{ color: '#EAD7C3', fontSize: '24px', fontWeight: 'bold' }}>Drop your 360° image here</p>
          <p style={{ color: '#bcb09b' }}>Supports JPG, PNG (Equirectangular format)</p>
        </div>
      )}

      {/* Admin Sidebar */}
      {editMode && (
        <div style={{
          width: '320px',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(196,154,108,0.4)',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 20
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ color: '#EAD7C3', fontSize: '20px', marginBottom: '16px' }}>🎨 Admin Panel</h2>
            <button
              onClick={() => setShowAddSceneModal(true)}
              style={{
                width: '100%',
                background: '#C49A6C',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                color: '#5C3A21',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              + Add New Scene
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#bcb09b', fontSize: '14px', marginBottom: '12px' }}>📸 Scenes</h3>
            {scenes.map(scene => (
              <div key={scene.id} style={{
                background: selectedSceneId === scene.id ? 'rgba(196,154,108,0.3)' : 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedSceneId(scene.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ color: '#EAD7C3', fontWeight: 'bold' }}>{scene.title}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScene(scene.id);
                    }}
                    style={{
                      background: '#8b3a3a',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={scene.showInGuide === true}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleShowInGuide(scene.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: '#bcb09b', fontSize: '11px' }}>Show in Guide</span>
                  </label>
                  <div style={{ color: '#9b8e72', fontSize: '11px' }}>
                    {scene.guides?.length || 0} guides | 
                    {scene.hotspots?.filter(h => h.type === 'navigation').length || 0} nav | 
                    {scene.hotspots?.filter(h => h.type === 'info').length || 0} info
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#bcb09b', fontSize: '14px', margin: 0 }}>✨ Current Scene Guides</h3>
              <button
                onClick={() => setShowAddGuideModal(true)}
                style={{
                  background: '#C49A6C',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  color: '#5C3A21',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                + Add Guide
              </button>
            </div>
            {currentScene.guides?.length === 0 ? (
              <p style={{ color: '#9b8e72', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                No guides yet. Click "Add Guide" to create navigation buttons!
              </p>
            ) : (
              currentScene.guides?.map((guide, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  fontSize: '12px',
                  borderLeft: '3px solid #C49A6C',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#EAD7C3' }}>
                      🧭 {guide.title}
                    </div>
                    <div style={{ color: '#9b8e72', fontSize: '10px' }}>
                      → {scenes.find(s => s.id === guide.targetSceneId)?.title || 'Unknown scene'}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGuideFromScene(idx)}
                    style={{
                      background: '#8b3a3a',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '10px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#bcb09b', fontSize: '14px', marginBottom: '12px' }}>🎯 Default View</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#EAD7C3', fontSize: '12px' }}>
                Pitch: {currentScene.defaultView?.pitch || 0}°<br/>
                Yaw: {currentScene.defaultView?.yaw || 0}°
              </div>
              <button
                onClick={() => {
                  const newPitch = prompt("Enter default pitch (-90 to 90):", currentScene.defaultView?.pitch || 0);
                  const newYaw = prompt("Enter default yaw (-180 to 180):", currentScene.defaultView?.yaw || 0);
                  if (newPitch !== null && newYaw !== null) {
                    const updatedScenes = scenes.map(scene => {
                      if (scene.id === currentScene.id) {
                        return {
                          ...scene,
                          defaultView: {
                            pitch: parseFloat(newPitch),
                            yaw: parseFloat(newYaw)
                          }
                        };
                      }
                      return scene;
                    });
                    saveScenesToJSON(updatedScenes);
                  }
                }}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  background: '#2c3e2f',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '6px',
                  color: '#EAD7C3',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Set Default View
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#bcb09b', fontSize: '14px', marginBottom: '12px' }}>🖼️ Update Scene Image</h3>
            <label style={{
              background: '#2c3e2f',
              padding: '10px',
              borderRadius: '12px',
              color: '#EAD7C3',
              cursor: 'pointer',
              display: 'block',
              textAlign: 'center'
            }}>
              Upload New 360° Image
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{ fontSize: '11px', color: '#9b8e72', textAlign: 'center', borderTop: '1px solid rgba(210,180,110,0.2)', paddingTop: '16px' }}>
            💡 Tip: Click on the panorama to add info/navigation hotspots
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        {/* Header with Mode Toggles */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 'bold',
              color: '#EAD7C3',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <span>🏛️</span>
              Moroccan Museum 360°
              <span>🕋</span>
            </h1>
            <p style={{ color: '#bcb09b', fontSize: '14px' }}>
              {currentScene.title} • {guideScenes.length} guided {guideScenes.length === 1 ? 'destination' : 'destinations'} available
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                background: editMode ? '#C49A6C' : '#2c3e2f',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '40px',
                color: editMode ? '#5C3A21' : '#EAD7C3',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {editMode ? '✏️ Exit Edit Mode' : '🔧 Enter Edit Mode'}
            </button>
          </div>
        </div>

        {/* 360° Viewer */}
        <div style={{
          position: 'relative',
          background: '#000',
          borderRadius: '24px',
          overflow: 'visible',
          boxShadow: '0 25px 45px rgba(0,0,0,0.4), 0 0 0 1px rgba(196,154,108,0.3)'
        }}>
          <div 
            ref={panoramaRef} 
            style={{
              width: '100%',
              height: '60vh',
              minHeight: '450px',
              background: '#000',
              position: 'relative'
            }}
          />
          
          {editMode && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(196,154,108,0.9)',
              padding: '8px 16px',
              borderRadius: '40px',
              color: '#5C3A21',
              fontSize: '12px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              ✏️ Edit Mode: Click anywhere to add hotspot
            </div>
          )}
          
          {/* Explore Places Button - Now shows guides from current scene */}
          {!editMode && (
            <button
              onClick={() => setShowGuideMenu(!showGuideMenu)}
              style={{
                position: 'absolute',
                top: '20px',
                left: '40px',
                background: 'rgba(92, 58, 33, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid #C49A6C',
                padding: '12px 20px',
                borderRadius: '40px',
                color: '#EAD7C3',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>📍</span>
              Explore Places
              <span>▼</span>
            </button>
          )}
          
          {/* Guide Menu Dropdown - Shows guides from current scene */}
          {showGuideMenu && !editMode && (
            <div style={{
              position: 'absolute',
              top: '80px',
              left: '20px',
              background: 'rgba(0,0,0,0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              padding: '16px',
              minWidth: '280px',
              maxWidth: '350px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 20,
              border: '1px solid #C49A6C',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '1px solid rgba(196,154,108,0.3)'
              }}>
                <h3 style={{ color: '#EAD7C3', margin: 0, fontSize: '18px' }}>
                  📍 Places in {currentScene.title}
                </h3>
                <button
                  onClick={() => setShowGuideMenu(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C49A6C',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0 8px'
                  }}
                >
                  ✕
                </button>
              </div>
              
              {currentScene.guides && currentScene.guides.length > 0 ? (
                currentScene.guides.map((guide, idx) => {
                  const targetScene = scenes.find(s => s.id === guide.targetSceneId);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleGuideClick(guide);
                        setShowGuideMenu(false);
                      }}
                      style={{
                        width: '100%',
                        background: activeInfoPanel === guide.title 
                          ? 'rgba(196,154,108,0.3)'
                          : 'rgba(196,154,108,0.1)',
                        border: '1px solid rgba(196,154,108,0.3)',
                        padding: '12px',
                        borderRadius: '8px',
                        color: '#EAD7C3',
                        cursor: 'pointer',
                        marginBottom: '8px',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontSize: '13px',
                        fontWeight: activeInfoPanel === guide.title ? 'bold' : 'normal'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(196,154,108,0.2)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = activeInfoPanel === guide.title 
                          ? 'rgba(196,154,108,0.3)'
                          : 'rgba(196,154,108,0.1)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🧭</span>
                        {guide.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#bcb09b', marginTop: '4px' }}>
                        → {targetScene?.title || 'Unknown destination'}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p style={{ color: '#bcb09b', textAlign: 'center', padding: '20px' }}>
                  No destinations available for this location.<br/>
                  Add guides in edit mode!
                </p>
              )}
            </div>
          )}

          {/* Info Panel - Parchment style */}
          {activeInfoPanel && (
            <div style={{
              position: 'absolute',
              bottom: '100px',
              right: '20px',
              width: '320px',
              maxWidth: '90%',
              background: 'linear-gradient(135deg, #FDF5E6 0%, #F8F0E0 100%)',
              borderRadius: '16px',
              padding: '20px',
              zIndex: 999999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 0 0 2px #C49A6C',
              border: '1px solid #8B5A2B',
              animation: 'slideIn 0.3s ease-out',
              pointerEvents: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                borderBottom: '2px solid #C49A6C',
                paddingBottom: '8px'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#5C3A21',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'Georgia, serif'
                }}>
                  ℹ️ {activeInfoPanel}
                </h3>
                <button
                  onClick={() => setActiveInfoPanel(null)}
                  style={{
                    background: '#8B5A2B',
                    border: 'none',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    color: '#FDF5E6',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#5C3A21'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#8B5A2B'}
                >
                  Fermer ✕
                </button>
              </div>
              <div style={{
                color: '#3A2417',
                fontSize: '14px',
                lineHeight: '1.6',
                fontFamily: 'Georgia, serif'
              }}>
                {currentScene.guides?.find(g => g.title === activeInfoPanel)?.infoContent || 
                 `Explore ${activeInfoPanel} - a wonderful destination in our virtual museum tour.`}
              </div>
              <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #C49A6C' }}>
                <button
                  onClick={() => {
                    const guide = currentScene.guides?.find(g => g.title === activeInfoPanel);
                    if (guide && guide.targetSceneId) {
                      changeScene(guide.targetSceneId);
                      setActiveInfoPanel(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #C49A6C 0%, #8B5A2B 100%)',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#FDF5E6',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🚪 Visit this destination
                </button>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              zIndex: 10,
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #d4bc8a',
                borderTopColor: '#C49A6C',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#EAD7C3' }}>Loading 360° panorama...</p>
            </div>
          )}
        </div>

        {/* Controls Section */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          borderRadius: '60px',
          padding: '12px 20px',
          border: '1px solid rgba(196,154,108,0.4)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#EAD7C3' }}>🎨 Contrast</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.01"
              value={contrast}
              onChange={handleContrastChange}
              style={{
                width: '160px',
                height: '5px',
                background: '#C49A6C',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            />
            <span style={{
              background: '#5C3A21',
              padding: '4px 12px',
              borderRadius: '30px',
              color: '#EAD7C3',
              fontFamily: 'monospace',
              minWidth: '55px',
              textAlign: 'center'
            }}>
              {contrast.toFixed(2)}
            </span>
            <button
              onClick={resetContrast}
              style={{
                background: '#5C3A21',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '30px',
                color: '#EAD7C3',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              🔄 Reset
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={resetView}
              style={{
                background: '#5C3A21',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '30px',
                color: '#EAD7C3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              🎯 Center View
            </button>
            <button
              onClick={toggleFullscreen}
              style={{
                background: '#5C3A21',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '30px',
                color: '#EAD7C3',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              ⛶ Fullscreen
            </button>
          </div>
        </div>

        {/* Scene Gallery - Shows all scenes */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '16px 20px'
        }}>
          <h3 style={{ color: '#bcb09b', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📍 All Scenes
            <span style={{ fontSize: '11px', color: '#C49A6C' }}>
              (⭐ = appears in guide)
            </span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {scenes.map((scene) => {
              const inGuide = scene.showInGuide === true;
              return (
                <button
                  key={scene.id}
                  onClick={() => changeScene(scene.id)}
                  style={{
                    background: selectedSceneId === scene.id ? '#C49A6C' : '#5C3A21',
                    border: inGuide && selectedSceneId !== scene.id ? '1px solid #C49A6C' : 'none',
                    padding: '8px 18px',
                    borderRadius: '40px',
                    color: selectedSceneId === scene.id ? '#5C3A21' : '#EAD7C3',
                    cursor: 'pointer',
                    fontWeight: selectedSceneId === scene.id ? '600' : '400',
                    transition: 'all 0.2s',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {scene.title}
                  {inGuide && <span style={{ fontSize: '12px' }}>⭐</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Footer */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '11px',
          color: '#9b8e72',
          padding: '12px',
          borderTop: '1px solid rgba(210,180,110,0.2)'
        }}>
          <span>🖱️ Drag to rotate • Scroll to zoom • Click hotspots to interact</span>
          {editMode && <span style={{ marginLeft: '20px' }}>✏️ Edit Mode: Click anywhere to add hotspots</span>}
          {!editMode && currentScene.guides?.length > 0 && (
            <span style={{ marginLeft: '20px', color: '#C49A6C' }}>
              🧭 Click "Explore Places" to discover destinations from this location!
            </span>
          )}
        </div>
      </div>

      {/* Add Guide Modal */}
      {showAddGuideModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#5C3A21',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(196,154,108,0.4)'
          }}>
            <h2 style={{ color: '#EAD7C3', marginBottom: '20px' }}>Add Guide to {currentScene.title}</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>Guide Title</label>
              <input
                type="text"
                value={newGuideTitle}
                onChange={(e) => setNewGuideTitle(e.target.value)}
                placeholder="e.g., Go to Museum Hall"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#3A2417',
                  border: '1px solid rgba(196,154,108,0.4)',
                  borderRadius: '8px',
                  color: '#EAD7C3'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>Target Scene</label>
              <select
                value={newGuideTargetId}
                onChange={(e) => setNewGuideTargetId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#3A2417',
                  border: '1px solid rgba(196,154,108,0.4)',
                  borderRadius: '8px',
                  color: '#EAD7C3'
                }}
              >
                <option value="">Select a scene...</option>
                {scenes.filter(s => s.id !== currentScene.id).map(scene => (
                  <option key={scene.id} value={scene.id}>{scene.title}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={addGuideToCurrentScene}
                style={{
                  flex: 1,
                  background: '#C49A6C',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#5C3A21',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Add Guide
              </button>
              <button
                onClick={() => {
                  setShowAddGuideModal(false);
                  setNewGuideTitle('');
                  setNewGuideTargetId('');
                }}
                style={{
                  flex: 1,
                  background: '#3A2417',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#EAD7C3',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotspot Creation Modal */}
      {showHotspotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#5C3A21',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(196,154,108,0.4)'
          }}>
            <h2 style={{ color: '#EAD7C3', marginBottom: '20px' }}>Add Hotspot</h2>
            <p style={{ color: '#bcb09b', fontSize: '12px', marginBottom: '20px' }}>
              Position: Pitch {selectedHotspotPosition?.pitch.toFixed(1)}°, Yaw {selectedHotspotPosition?.yaw.toFixed(1)}°
            </p>
            
            <HotspotForm
              scenes={scenes}
              onSubmit={addHotspot}
              onCancel={() => {
                setShowHotspotModal(false);
                setSelectedHotspotPosition(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Add Scene Modal */}
      {showAddSceneModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#5C3A21',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(196,154,108,0.4)'
          }}>
            <h2 style={{ color: '#EAD7C3', marginBottom: '20px' }}>Add New Scene</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>Scene Title</label>
              <input
                type="text"
                value={newSceneTitle}
                onChange={(e) => setNewSceneTitle(e.target.value)}
                placeholder="e.g., Garden View"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#3A2417',
                  border: '1px solid rgba(196,154,108,0.4)',
                  borderRadius: '8px',
                  color: '#EAD7C3'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>Image URL or Upload</label>
              <input
                type="text"
                value={newSceneImage}
                onChange={(e) => setNewSceneImage(e.target.value)}
                placeholder="https://example.com/360-image.jpg"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#3A2417',
                  border: '1px solid rgba(196,154,108,0.4)',
                  borderRadius: '8px',
                  color: '#EAD7C3',
                  marginBottom: '12px'
                }}
              />
              <label style={{
                background: '#5C3A21',
                padding: '8px',
                borderRadius: '8px',
                color: '#EAD7C3',
                cursor: 'pointer',
                display: 'block',
                textAlign: 'center',
                fontSize: '12px'
              }}>
                Or Upload Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewSceneImage(event.target.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={addNewScene}
                style={{
                  flex: 1,
                  background: '#C49A6C',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#5C3A21',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Add Scene
              </button>
              <button
                onClick={() => {
                  setShowAddSceneModal(false);
                  setNewSceneTitle('');
                  setNewSceneImage('');
                }}
                style={{
                  flex: 1,
                  background: '#3A2417',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  color: '#EAD7C3',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        input[type="range"] {
          -webkit-appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #C49A6C;
          border: 2px solid #EAD7C3;
          cursor: pointer;
        }
        
        button:hover, label:hover {
          transform: scale(1.02);
          transition: transform 0.2s;
        }
        
        button:active, label:active {
          transform: scale(0.98);
        }
        
        .custom-hotspot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s;
          transform: translate(-50%, -50%);
        }
        
        .custom-hotspot:hover {
          transform: scale(1.2);
        }
        
        .navigation-hotspot {
          background: rgba(52, 152, 219, 0.9);
          border: 2px solid #fff;
          box-shadow: 0 0 10px rgba(52, 152, 219, 0.8);
        }
        
        .info-hotspot {
          background: rgba(241, 196, 15, 0.9);
          border: 2px solid #fff;
          box-shadow: 0 0 8px rgba(241, 196, 15, 0.6);
        }
        
        .hotspot-tooltip {
          position: absolute;
          bottom: 35px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.95);
          backdrop-filter: blur(8px);
          padding: 10px 14px;
          border-radius: 12px;
          white-space: nowrap;
          font-size: 12px;
          pointer-events: auto;
          z-index: 100;
          border: 1px solid rgba(196,154,108,0.3);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        .tooltip-content {
          color: #EAD7C3;
        }
        
        .navigate-btn {
          background: #C49A6C;
          border: none;
          padding: 4px 12px;
          border-radius: 20px;
          color: #5C3A21;
          cursor: pointer;
          margin-top: 5px;
          font-size: 11px;
          font-weight: bold;
        }
        
        .navigate-btn:hover {
          background: #d4ac6c;
          transform: scale(1.05);
        }
        
        .info-tooltip p {
          margin: 5px 0 0 0;
          font-size: 11px;
          color: #bcb09b;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #3A2417;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #C49A6C;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #d4ac6c;
        }
      `}</style>
    </div>
  );
};

// Hotspot Form Component
const HotspotForm = ({ scenes, onSubmit, onCancel }) => {
  const [type, setType] = useState('info');
  const [text, setText] = useState('');
  const [targetSceneId, setTargetSceneId] = useState(scenes[0]?.id || null);
  
  const handleSubmit = () => {
    if (!text.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (type === 'navigation' && !targetSceneId) {
      alert('Please select a target scene');
      return;
    }
    
    onSubmit(type, text, targetSceneId);
  };
  
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>Hotspot Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#3A2417',
            border: '1px solid rgba(196,154,108,0.4)',
            borderRadius: '8px',
            color: '#EAD7C3'
          }}
        >
          <option value="info">ℹ️ Info - Show information</option>
          <option value="navigation">🚪 Navigation - Switch to another scene</option>
        </select>
      </div>
      
      {type === 'navigation' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>
            Target Scene
          </label>
          <select
            value={targetSceneId}
            onChange={(e) => setTargetSceneId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              background: '#3A2417',
              border: '1px solid rgba(196,154,108,0.4)',
              borderRadius: '8px',
              color: '#EAD7C3'
            }}
          >
            {scenes.map(scene => (
              <option key={scene.id} value={scene.id}>{scene.title}</option>
            ))}
          </select>
        </div>
      )}
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ color: '#bcb09b', display: 'block', marginBottom: '8px' }}>Description / Hint Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Ancient artifact from 12th century"
          rows="3"
          style={{
            width: '100%',
            padding: '10px',
            background: '#3A2417',
            border: '1px solid rgba(196,154,108,0.4)',
            borderRadius: '8px',
            color: '#EAD7C3',
            resize: 'vertical'
          }}
        />
      </div>
      
      <div style={{ 
        marginBottom: '20px',
        padding: '10px',
        background: 'rgba(196,154,108,0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#C49A6C'
      }}>
        <strong>💡 Tip:</strong> Info hotspots show information about what users are looking at.
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          style={{
            flex: 1,
            background: '#C49A6C',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            color: '#5C3A21',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Add Hotspot
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            background: '#3A2417',
            border: 'none',
            padding: '12px',
            borderRadius: '12px',
            color: '#EAD7C3',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default App;