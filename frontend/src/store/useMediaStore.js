import { create } from 'zustand'
import { toast } from 'sonner'
import axios from "axios";
import PythonApi from '@/lib/PythonApi'

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

const useMediaStore = create(
    (set, get) => ({
        // State
        isLoading: false,
        error: null,
        
        // Comics
        comics: {
            isGenerating: false,
            images: [], // [{ index, url }]
            saved: [],
            currentComic: null,
            liveViewerOpen: false,
            previewOpen: false,
            previewComic: null,
            viewMode: 'grid', // 'grid' or 'list'
            abortController: null
        },

        // Images
        images: {
            isGenerating: false,
            currentImage: null,
            saved: [],
            previewOpen: false,
            previewItem: null
        },

        // Slides/Presentations
        slides: {
            isGenerating: false,
            isSaving: false,
            currentPresentation: null,
            saved: [],
            isLoadingSaved: false
        },

        // Video
        video: {
            isGenerating: false,
            currentVideo: null,
            saved: []
        },

        // Web Search
        webSearch: {
            isGenerating: false,
            currentResults: null,
            saved: [],
            previewOpen: false,
            previewItem: null
        },

        // Actions
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // ==============================
        // COMICS ACTIONS
        // ==============================
        
        // Initialize comics data from database
        initializeComics: async () => {
            const { setComicsState, setError } = get()
            try {
                const response = await axiosInstance.get("/api/media/comic");
                if (response.status === 200) {
                    setComicsState({ saved: response.data || [] });
                }
            } catch (error) {
                console.error('Failed to initialize comics:', error);
                setComicsState({ saved: [] }); // Set empty array on error
            }
        },

        // Generate comics via streaming
        startComicsStream: async (comicsData) => {
            const { setComicsState, setError } = get()
            
            console.log('Starting comics stream with data:', comicsData)
            
            // Reset state at the beginning
            setComicsState({
                isGenerating: true,
                images: [], // Make sure images array is initialized
                saved: get().comics.saved || [],
                currentComic: null,
                liveViewerOpen: true,
                previewOpen: false,
                previewComic: null,
                abortController: null
            })

            try {
                const abortController = new AbortController()
                setComicsState({ abortController })

                const response = await PythonApi.startComicsStream(comicsData)
                
                console.log('Stream response status:', response.status)
                console.log('Stream response headers:', response.headers)
                
                if (!response.ok || !response.body) {
                    const txt = await response.text().catch(() => '')
                    console.error('Stream response error:', txt)
                    throw new Error(txt || 'Failed to start stream')
                }

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                let buffer = ''

                while (true) {
                    const { value, done } = await reader.read()
                    if (done) break
                    
                    const chunk = decoder.decode(value, { stream: true })
                    console.log('Received chunk:', chunk)
                    buffer += chunk

                    const parts = buffer.split('\n\n')
                    buffer = parts.pop() || ''
                    
                    for (const part of parts) {
                        const line = part.trim()
                        if (!line.startsWith('data:')) continue
                        
                        const json = line.slice(5).trim()
                        console.log('Parsing JSON:', json)
                        
                        try {
                            const evt = JSON.parse(json)
                            console.log('Parsed event:', evt)
                            
                            // Handle story prompts
                            if (evt.type === 'story_prompts') {
                                console.log('Story prompts received:', evt.content)
                            }
                            
                            // Handle panel prompts
                            if (evt.type === 'panel_prompt') {
                                console.log(`Panel ${evt.index} prompt:`, evt.prompt)
                            }
                            
                            // Handle panel images - convert base64 to data URL
                            if (evt.type === 'panel_image' && evt.url) {
                                console.log(`Panel ${evt.index} image received, length:`, evt.url.length)
                                // Convert base64 to data URL
                                const dataUrl = `data:image/png;base64,${evt.url}`
                                
                                // Use the set function directly to update state
                                set(state => {
                                    const currentComics = state.comics
                                    const newImages = currentComics.images.some(p => p.index === evt.index)
                                        ? currentComics.images.map(p => p.index === evt.index ? { index: evt.index, url: dataUrl } : p)
                                        : [...currentComics.images, { index: evt.index, url: dataUrl }].sort((a, b) => a.index - b.index)
                                    
                                    console.log('Updated images:', newImages)
                                    return {
                                        ...state,
                                        comics: {
                                            ...currentComics,
                                            images: newImages
                                        }
                                    }
                                })
                            }
                            
                            // Handle completion
                            if (evt.type === 'done') {
                                console.log('Comic generation completed')
                            }
                            
                            // Handle errors
                            if (evt.type === 'error') {
                                throw new Error(evt.message || 'Comic generation failed')
                            }
                        } catch (parseError) {
                            console.error('Error parsing SSE event:', parseError)
                        }
                    }
                }
            } catch (e) {
                console.error('Stream error:', e)
                if (e.name !== 'AbortError') {
                    setError(e.message)
                    // Removed toast - let UI handle user feedback
                }
            } finally {
                setComicsState({ isGenerating: false })
            }
        },

        stopComicsStream: () => {
            const { comics } = get()
            if (comics.abortController) {
                comics.abortController.abort()
            }
            set(state => ({
                comics: { ...state.comics, isGenerating: false }
            }))
        },

        // Fetch all comics
        fetchComics: async () => {
            const { setComicsState, setError } = get()
            set({ isLoading: true, error: null });
            try {
                const response = await axiosInstance.get("/api/media/comic");
                if (response.status === 200) {
                    setComicsState({ saved: response.data || [], isLoading: false });
                    return response.data;
                }
            } catch (error) {
                console.error('Failed to fetch comics:', error);
                set({ 
                    error: error.response?.data?.message || 'Failed to load comics',
                    isLoading: false 
                });
                throw error;
            }
        },

        saveComic: async (comicData) => {
            const { setComicsState, setError } = get()
            
            // Set saving state to true
            setComicsState({ isSaving: true })
            
            try {
                console.log('Saving comic with data:', comicData);
                
                // Check if we have images to upload
                if (comicData.images && comicData.images.length > 0) {
                    // Convert base64 images to blobs and upload to Cloudinary
                    const uploadedImageUrls = [];
                    
                    for (let i = 0; i < comicData.images.length; i++) {
                        const imageData = comicData.images[i];
                        
                        // Check if the image is base64 data
                        if (imageData.startsWith('data:image/')) {
                            // Convert base64 to blob for upload
                            const response = await fetch(imageData);
                            const blob = await response.blob();
                            
                            // Upload directly to Cloudinary using a separate endpoint
                            const formData = new FormData();
                            formData.append('image', blob, `comic-panel-${i + 1}.png`);
                            formData.append('folder', 'ed-teach-comics'); // Use a different folder for comics
                            
                            // Use a direct Cloudinary upload endpoint or modify the existing one
                            const uploadResponse = await axiosInstance.post("/api/media/upload-comic-image", formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });

                            if (uploadResponse.status === 201) {
                                uploadedImageUrls.push(uploadResponse.data.imageUrl);
                            }
                        } else {
                            // If it's already a URL, use it directly
                            uploadedImageUrls.push(imageData);
                        }
                    }
                    
                    // Now save the comic with the uploaded image URLs
                    const response = await axiosInstance.post("/api/media/comic", {
                        instruction: comicData.instructions,
                        subject: comicData.subject || 'General',
                        grade: comicData.gradeLevel || '8',
                        language: comicData.language || 'English',
                        comicType: comicData.comicType || 'educational',
                        imageUrls: uploadedImageUrls // Add the uploaded image URLs
                    });

                    if (response.status === 201) {
                        const savedComic = response.data;
                        // Clear ALL live preview state after successful save
                        setComicsState(prev => ({ 
                            saved: [savedComic, ...prev.saved],
                            images: [], // Clear current images
                            liveViewerOpen: false, // Close the modal
                            previewOpen: false, // Close preview modal if open
                            previewComic: null, // Clear preview comic
                            currentComic: null, // Clear current comic
                            isSaving: false // Reset saving state
                        }))
                        // Removed toast - let UI handle user feedback
                        return savedComic;
                    }
                } else {
                    // No images to upload, save comic data only
                    const response = await axiosInstance.post("/api/media/comic", {
                        instruction: comicData.instructions,
                        subject: comicData.subject || 'General',
                        grade: comicData.gradeLevel || '8',
                        language: comicData.language || 'English',
                        comicType: comicData.comicType || 'educational'
                    });

                    if (response.status === 201) {
                        const savedComic = response.data;
                        // Clear ALL live preview state after successful save
                        setComicsState(prev => ({ 
                            saved: [savedComic, ...prev.saved],
                            images: [], // Clear current images
                            liveViewerOpen: false, // Close the modal
                            previewOpen: false, // Close preview modal if open
                            previewComic: null, // Clear preview comic
                            currentComic: null, // Clear current comic
                            isSaving: false // Reset saving state
                        }))
                        // Removed toast - let UI handle user feedback
                        return savedComic;
                    }
                }
            } catch (error) {
                console.error('Save comic error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to save comic';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                // Reset saving state on error
                setComicsState({ isSaving: false })
                throw error;
            }
        },

        deleteComic: async (id) => {
            const { setComicsState, setError } = get()
            
            try {
                const response = await axiosInstance.delete(`/api/media/comic/${id}`);

                if (response.status === 200) {
                    setComicsState(prev => ({ saved: prev.saved.filter(x => x._id !== id) }))
                    // Removed toast - let UI handle user feedback
                    return true;
                }
            } catch (error) {
                console.error('Delete comic error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete comic';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            }
        },

        setComicsState: (updates) => set(state => ({
            comics: { ...state.comics, ...updates }
        })),

        // ==============================
        // IMAGES ACTIONS
        // ==============================

        // Initialize images data from database
        initializeImages: async () => {
            const { setImagesState, setError } = get()
            try {
                const response = await axiosInstance.get("/api/media/image");
                if (response.status === 200) {
                    setImagesState({ saved: response.data || [] });
                }
            } catch (error) {
                console.error('Failed to initialize images:', error);
                setImagesState({ saved: [] }); // Set empty array on error
            }
        },

        // Fetch all images
        fetchImages: async () => {
            const { setImagesState, setError } = get()
            set({ isLoading: true, error: null });
            try {
                const response = await axiosInstance.get("/api/media/image");
                if (response.status === 200) {
                    setImagesState({ saved: response.data || [], isLoading: false });
                    return response.data;
                }
            } catch (error) {
                console.error('Failed to fetch images:', error);
                set({ 
                    error: error.response?.data?.message || 'Failed to load images',
                    isLoading: false 
                });
                throw error;
            }
        },

        generateImage: async (imageData) => {
            const { setImagesState, setError } = get()
            
            setImagesState({ isGenerating: true, error: null, currentImage: null })
            
            try {
                const response = await PythonApi.generateImage(imageData)
                
                if (response.image_url) {
                    setImagesState({ currentImage: response.image_url })
                    // Removed toast - let UI handle user feedback
                    
                    // Removed auto-save - user will manually save if needed
                }
            } catch (e) {
                setError(e.message)
                // Removed toast - let UI handle user feedback
            } finally {
                setImagesState({ isGenerating: false })
            }
        },

        saveImage: async (imageData) => {
            const { setImagesState, setError } = get()
            
            try {
                console.log('Saving image with URL:', imageData.imageUrl);
                
                // Check if the image is base64 data
                const isBase64 = imageData.imageUrl && imageData.imageUrl.startsWith('data:image/');
                
                if (isBase64) {
                    // Convert base64 to blob for upload
                    const response = await fetch(imageData.imageUrl);
                    const blob = await response.blob();
                    
                    // Create FormData for file upload
                    const formData = new FormData();
                    formData.append('image', blob, 'generated-image.png');
                    formData.append('topic', imageData.topic);
                    formData.append('subject', imageData.subject);
                    formData.append('grade', imageData.gradeLevel || '8'); // Use auto-detected grade
                    formData.append('visualLevel', imageData.difficultyFlag);
                    formData.append('visualType', imageData.visualType);
                    formData.append('language', imageData.language);
                    formData.append('status', 'completed');

                    const uploadResponse = await axiosInstance.post("/api/media/image", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (uploadResponse.status === 201) {
                        const savedImage = uploadResponse.data;
                        setImagesState(prev => ({ saved: [savedImage, ...prev.saved] }))
                        // Removed toast - let UI handle user feedback
                        return savedImage;
                    }
                } else {
                    // If it's already a URL (from Cloudinary or external), save directly
                    const response = await axiosInstance.post("/api/media/image", {
                        topic: imageData.topic,
                        subject: imageData.subject,
                        grade: imageData.gradeLevel || '8', // Use auto-detected grade
                        visualLevel: imageData.difficultyFlag,
                        visualType: imageData.visualType,
                        language: imageData.language,
                        imageUrl: imageData.imageUrl,
                        status: 'completed'
                    });

                    if (response.status === 201) {
                        const savedImage = response.data;
                        setImagesState(prev => ({ saved: [savedImage, ...prev.saved] }))
                        // Removed toast - let UI handle user feedback
                        return savedImage;
                    }
                }
            } catch (error) {
                console.error('Save image error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to save image';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            }
        },

        deleteImage: async (id) => {
            const { setImagesState, setError } = get()
            
            try {
                const response = await axiosInstance.delete(`/api/media/image/${id}`);

                if (response.status === 200) {
                    setImagesState(prev => ({ saved: prev.saved.filter(x => x._id !== id) }))
                    // Removed toast - let UI handle user feedback
                    return true;
                }
            } catch (error) {
                console.error('Delete image error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete image';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            }
        },

        setImagesState: (updates) => set(state => ({
            images: { ...state.images, ...updates }
        })),

        // ==============================
        // SLIDES/PRESENTATIONS ACTIONS
        // ==============================

        // Initialize slides data from database
        initializeSlides: async () => {
            const { setSlidesState, setError } = get()
            try {
                const response = await axiosInstance.get("/api/media/slide");
                if (response.status === 200) {
                    setSlidesState({ saved: response.data || [] });
                }
            } catch (error) {
                console.error('Failed to initialize slides:', error);
                setSlidesState({ saved: [] }); // Set empty array on error
            }
        },

        // Fetch all slides
        fetchSlides: async () => {
            const { setSlidesState, setError } = get()
            set({ isLoading: true, error: null });
            try {
                const response = await axiosInstance.get("/api/media/slide");
                if (response.status === 200) {
                    setSlidesState({ saved: response.data || [], isLoading: false });
                    return response.data;
                }
            } catch (error) {
                console.error('Failed to fetch slides:', error);
                set({ 
                    error: error.response?.data?.message || 'Failed to load slides',
                    isLoading: false 
                });
                throw error;
            }
        },

        generatePresentation: async (presentationData) => {
            const { setSlidesState, setError } = get()
            
            setSlidesState({ isGenerating: true, error: null, currentPresentation: null })
            
            try {
                console.log('Generating presentation with data:', presentationData);
                
                // Add gradeLevel and template to the Python API call
                const response = await PythonApi.generatePresentation({
                    ...presentationData,
                    gradeLevel: presentationData.gradeLevel || '8', // Default to grade 8 if not provided
                    template: presentationData.template || 'default' // Default to default template if not provided
                })
                
                console.log('Python API presentation response:', response);
                
                // Handle the specific response structure from Python API
                let presentation = null;
                
                if (response && response.presentation) {
                    const presData = response.presentation;
                    
                    // Extract URL from task_result or task_info
                    const presentationUrl = presData.task_result?.url || presData.task_info?.url;
                    const status = presData.task_status || 'completed';
                    
                    presentation = {
                        presentationUrl: presentationUrl,
                        downloadUrl: presentationUrl, // Use same URL for download
                        slideCount: presentationData.slideCount || 10,
                        status: status,
                        taskId: presData.task_id,
                        template: presentationData.template || 'default' // Include template in presentation data
                    };
                    
                    console.log('Extracted presentation data:', presentation);
                } else if (response && typeof response === 'object') {
                    // Fallback for other response structures
                    presentation = response.presentation || response.data || response;
                } else if (typeof response === 'string') {
                    // If response is a string, it might be a URL
                    presentation = {
                        presentationUrl: response,
                        downloadUrl: response,
                        slideCount: presentationData.slideCount || 10,
                        status: 'completed',
                        template: presentationData.template || 'default' // Include template in presentation data
                    };
                }
                
                if (presentation) {
                    setSlidesState({ currentPresentation: presentation })
                    // Removed toast - let UI handle user feedback
                    
                    // Removed auto-save - user will manually save if needed
                } else {
                    // Create a placeholder if no presentation data
                    console.warn('No presentation data received, creating placeholder');
                    const placeholderPresentation = {
                        title: presentationData.title || presentationData.topic,
                        topic: presentationData.topic,
                        presentationUrl: null,
                        downloadUrl: null,
                        slideCount: presentationData.slideCount || 10,
                        status: 'pending',
                        template: presentationData.template || 'default' // Include template in placeholder
                    };
                    
                    setSlidesState({ currentPresentation: placeholderPresentation })
                    
                    // Removed auto-save - user will manually save if needed
                }
            } catch (e) {
                console.error('Presentation generation error:', e);
                setError(e.message)
                // Removed toast - let UI handle user feedback
                
                // Removed auto-save on error
            } finally {
                setSlidesState({ isGenerating: false })
            }
        },

        savePresentation: async (presentationData) => {
            const { setSlidesState, setError } = get()
            
            setSlidesState({ isSaving: true })
            
            try {
                console.log('Saving presentation data:', presentationData);
                
                const response = await axiosInstance.post("/api/media/slide", {
                    title: presentationData.title || presentationData.topic || "Untitled Presentation",
                    subject: presentationData.subject || "General",
                    grade: presentationData.gradeLevel || "8", // Use auto-detected grade
                    verbosity: presentationData.verbosity || "standard",
                    topic: presentationData.topic || "General Topic",
                    stockImage: presentationData.includeImages || false,
                    customInstruction: presentationData.customInstructions || "",
                    language: presentationData.language || "English",
                    presentationUrl: presentationData.presentationUrl || null,
                    downloadUrl: presentationData.downloadUrl || null,
                    slideCount: presentationData.slideCount || 0,
                    status: presentationData.status || 'completed'
                });

                console.log('Backend response:', response.data);

                if (response.status === 201) {
                    const savedPresentation = response.data;
                    setSlidesState(prev => ({ saved: [savedPresentation, ...prev.saved] }))
                    // Removed toast - let UI handle user feedback
                    return savedPresentation;
                }
            } catch (error) {
                console.error('Save presentation error:', error);
                console.error('Error response:', error.response?.data);
                const errorMessage = error.response?.data?.message || 'Failed to save presentation';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            } finally {
                setSlidesState({ isSaving: false })
            }
        },

        deletePresentation: async (presentationId) => {
            const { setSlidesState, setError } = get()
            
            try {
                const response = await axiosInstance.delete(`/api/media/slide/${presentationId}`);

                if (response.status === 200) {
                    setSlidesState(prev => ({ saved: prev.saved.filter(p => p._id !== presentationId) }))
                    // Removed toast - let UI handle user feedback
                    return true;
                }
            } catch (error) {
                console.error('Delete presentation error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete presentation';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            }
        },

        setSlidesState: (updates) => set(state => ({
            slides: { ...state.slides, ...updates }
        })),

        // ==============================
        // VIDEO ACTIONS
        // ==============================

        generateVideo: async (videoData) => {
            const { setVideoState, setError } = get()
            
            setVideoState({ isGenerating: true, error: null })
            
            try {
                // Simulate video generation for now
                // TODO: Implement actual video generation API
                await new Promise(resolve => setTimeout(resolve, 3000))
                
                const generatedVideo = {
                    title: "Educational Video Created",
                    duration: `${videoData.duration} seconds`,
                    avatar: videoData.avatar,
                    preview: "HD video with AI avatar and professional voiceover",
                    gradeLevel: videoData.gradeLevel || '8' // Use auto-detected grade
                }
                
                setVideoState({ currentVideo: generatedVideo })
                // Removed toast - let UI handle user feedback
            } catch (e) {
                setError(e.message)
                // Removed toast - let UI handle user feedback
            } finally {
                setVideoState({ isGenerating: false })
            }
        },

        setVideoState: (updates) => set(state => ({
            video: { ...state.video, ...updates }
        })),

        // ==============================
        // WEB SEARCH ACTIONS
        // ==============================

        // Initialize web search data from database
        initializeWebSearch: async () => {
            const { setWebSearchState, setError } = get()
            try {
                const response = await axiosInstance.get("/api/media/web-search");
                if (response.status === 200) {
                    setWebSearchState({ saved: response.data || [] });
                }
            } catch (error) {
                console.error('Failed to initialize web search:', error);
                setWebSearchState({ saved: [] }); // Set empty array on error
            }
        },

        // Fetch all web searches
        fetchWebSearches: async () => {
            const { setWebSearchState, setError } = get()
            set({ isLoading: true, error: null });
            try {
                const response = await axiosInstance.get("/api/media/web-search");
                if (response.status === 200) {
                    setWebSearchState({ saved: response.data || [], isLoading: false });
                    return response.data;
                }
            } catch (error) {
                console.error('Failed to fetch web searches:', error);
                set({ 
                    error: error.response?.data?.message || 'Failed to load web searches',
                    isLoading: false 
                });
                throw error;
            }
        },

        performWebSearch: async (searchData) => {
            const { setWebSearchState, setError } = get()
            
            setWebSearchState({ isGenerating: true, error: null, currentResults: null })
            
            try {
                const response = await PythonApi.runWebSearch(searchData)
                
                if (response.content) {
                    setWebSearchState({ currentResults: response.content })
                    // Removed toast - let UI handle user feedback
                    
                    // Removed auto-save - user will manually save if needed
                }
            } catch (e) {
                setError(e.message)
                // Removed toast - let UI handle user feedback
            } finally {
                setWebSearchState({ isGenerating: false })
            }
        },

        saveWebSearch: async (searchData) => {
            const { setWebSearchState, setError } = get()
            
            try {
                const response = await axiosInstance.post("/api/media/web-search", {
                    searchTopic: searchData.topic,
                    contentType: searchData.contentType,
                    subject: searchData.subject,
                    grade: searchData.gradeLevel || '8', // Use auto-detected grade
                    comprehensionLevel: searchData.comprehension,
                    gradeLevel: searchData.gradeLevel || '8', // Use auto-detected grade
                    language: searchData.language,
                    searchResults: searchData.searchResults || '' // Send the actual search results
                });

                if (response.status === 201) {
                    const savedSearch = response.data;
                    setWebSearchState(prev => ({ saved: [savedSearch, ...prev.saved] }))
                    // Removed toast - let UI handle user feedback
                    return savedSearch;
                }
            } catch (error) {
                console.error('Save web search error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to save web search';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            }
        },

        deleteWebSearch: async (id) => {
            const { setWebSearchState, setError } = get()
            
            try {
                const response = await axiosInstance.delete(`/api/media/web-search/${id}`);

                if (response.status === 200) {
                    setWebSearchState(prev => ({ saved: prev.saved.filter(x => x._id !== id) }))
                    // Removed toast - let UI handle user feedback
                    return true;
                }
            } catch (error) {
                console.error('Delete web search error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete web search';
                setError(errorMessage)
                // Removed toast - let UI handle user feedback
                throw error;
            }
        },

        setWebSearchState: (updates) => set(state => ({
            webSearch: { ...state.webSearch, ...updates }
        })),

        // ==============================
        // UTILITY ACTIONS
        // ==============================

        downloadFile: (url, filename) => {
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.target = '_blank'
            document.body.appendChild(a)
            a.click()
            a.remove()
        },

        downloadMarkdown: (content, filename = 'content.md') => {
            const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
        },

        formatTime: (dateStr) => {
            try { 
                return new Date(dateStr).toLocaleString() 
            } catch { 
                return '' 
            }
        },

        // ==============================
        // CLEANUP
        // ==============================

        cleanup: () => {
            const { comics } = get()
            if (comics.abortController) {
                comics.abortController.abort()
            }
            
            // Clear all current state to prevent memory leaks
            set({
                comics: {
                    isGenerating: false,
                    images: [],
                    saved: [],
                    currentComic: null,
                    liveViewerOpen: false,
                    previewOpen: false,
                    previewComic: null,
                    viewMode: 'grid',
                    abortController: null
                },
                images: {
                    isGenerating: false,
                    currentImage: null,
                    saved: [],
                    previewOpen: false,
                    previewItem: null
                },
                slides: {
                    isGenerating: false,
                    isSaving: false,
                    currentPresentation: null,
                    saved: [],
                    isLoadingSaved: false
                },
                video: {
                    isGenerating: false,
                    currentVideo: null,
                    saved: []
                },
                webSearch: {
                    isGenerating: false,
                    currentResults: null,
                    saved: [],
                    previewOpen: false,
                    previewItem: null
                }
            })
        },

        // Add a function to clear current generated content
        clearCurrentContent: () => {
            set({
                comics: {
                    ...get().comics,
                    images: [],
                    currentComic: null
                },
                images: {
                    ...get().images,
                    currentImage: null
                },
                slides: {
                    ...get().slides,
                    currentPresentation: null
                },
                video: {
                    ...get().video,
                    currentVideo: null
                },
                webSearch: {
                    ...get().webSearch,
                    currentResults: null
                }
            })
        }
    })
)

export default useMediaStore
