import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, Save } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    location: string;
    createdAt: string;
}

interface FormData {
    title: string;
    architectName: string;
    areaSqFt: string;
    location: string;
    description: string;
    youtubeUrl?: string;
}

const AdminPanel: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        architectName: '',
        areaSqFt: '',
        location: '',
        description: '',
        youtubeUrl: '',
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [projectImages, setProjectImages] = useState<File[]>([]);
    const [modelFile, setModelFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'mainImage' | 'images' | 'model' | 'video') => {
        if (e.target.files) {
            if (type === 'images') {
                const files = Array.from(e.target.files);
                if (files.length + projectImages.length > 15) {
                    alert('Maximum 15 images allowed');
                    return;
                }
                setProjectImages(prev => [...prev, ...files]);
            } else if (e.target.files[0]) {
                const file = e.target.files[0];
                if (type === 'thumbnail') setThumbnailFile(file);
                if (type === 'mainImage') setMainImageFile(file);
                if (type === 'model') setModelFile(file);
                if (type === 'video') setVideoFile(file);
            }
        }
    };

    const removeProjectImage = (index: number) => {
        setProjectImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (projectImages.length < 5 || projectImages.length > 15) {
            alert('Please upload between 5 and 15 project images.');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('architectName', formData.architectName);
        data.append('areaSqFt', formData.areaSqFt);
        data.append('location', formData.location);
        data.append('description', formData.description);
        if (formData.youtubeUrl) data.append('youtubeUrl', formData.youtubeUrl);

        if (thumbnailFile) data.append('thumbnail', thumbnailFile);
        if (mainImageFile) data.append('mainImage', mainImageFile);
        projectImages.forEach(file => data.append('images', file));
        if (modelFile) data.append('model', modelFile);
        if (videoFile) data.append('video', videoFile);

        try {
            const response = await fetch('http://localhost:3001/api/projects', {
                method: 'POST',
                body: data,
            });

            if (response.ok) {
                alert('Project created successfully!');
                setIsCreating(false);
                fetchProjects(); // Refresh list
                // Reset form
                setFormData({
                    title: '',
                    architectName: '',
                    areaSqFt: '',
                    location: '',
                    description: '',
                    youtubeUrl: '',
                });
                setThumbnailFile(null);
                setMainImageFile(null);
                setProjectImages([]);
                setModelFile(null);
                setVideoFile(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to create project: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Error creating project');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90 transition-opacity"
                >
                    {isCreating ? 'Cancel' : <><Plus size={18} className="mr-2" /> New Project</>}
                </button>
            </div>

            {isCreating && (
                <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-md mb-10 border border-[var(--border)]">
                    <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Project Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Architect Name</label>
                                <input
                                    type="text"
                                    name="architectName"
                                    value={formData.architectName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Area (sq ft)</label>
                                <input
                                    type="number"
                                    name="areaSqFt"
                                    value={formData.areaSqFt}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">YouTube Video URL</label>
                            <input
                                type="url"
                                name="youtubeUrl"
                                value={formData.youtubeUrl || ''}
                                onChange={handleInputChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full p-2 rounded border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-2 border-dashed border-[var(--border)] p-6 rounded-lg text-center hover:bg-[var(--bg-primary)] transition-colors cursor-pointer relative">
                                <Upload className="mx-auto mb-2 text-[var(--text-secondary)]" />
                                <p className="text-sm font-medium">Upload Thumbnail</p>
                                <p className="text-xs text-[var(--text-secondary)]">Stored in DB (Max 500KB)</p>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                                />
                                {thumbnailFile && <p className="mt-2 text-sm text-[var(--accent)]">{thumbnailFile.name}</p>}
                            </div>
                            <div className="border-2 border-dashed border-[var(--border)] p-6 rounded-lg text-center hover:bg-[var(--bg-primary)] transition-colors cursor-pointer relative">
                                <Upload className="mx-auto mb-2 text-[var(--text-secondary)]" />
                                <p className="text-sm font-medium">Upload Main Image</p>
                                <p className="text-xs text-[var(--text-secondary)]">High-Res Image</p>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'mainImage')}
                                />
                                {mainImageFile && <p className="mt-2 text-sm text-[var(--accent)]">{mainImageFile.name}</p>}
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-[var(--border)] p-6 rounded-lg text-center hover:bg-[var(--bg-primary)] transition-colors cursor-pointer relative">
                            <Upload className="mx-auto mb-2 text-[var(--text-secondary)]" />
                            <p className="text-sm font-medium">Upload Project Images (5-15)</p>
                            <p className="text-xs text-[var(--text-secondary)]">Select multiple files</p>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileChange(e, 'images')}
                            />
                            {projectImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 pointer-events-none">
                                    {projectImages.map((file, index) => (
                                        <div key={index} className="bg-[var(--bg-primary)] p-2 rounded text-xs flex justify-between items-center pointer-events-auto">
                                            <span className="truncate max-w-[80%]">{file.name}</span>
                                            <button type="button" onClick={() => removeProjectImage(index)} className="text-red-500 hover:text-red-700">×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="mt-2 text-sm text-[var(--accent)]">{projectImages.length} images selected</p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center px-6 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-md hover:opacity-90"
                            >
                                <Save size={18} className="mr-2" /> Save Project
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-[var(--bg-secondary)] rounded-lg shadow overflow-hidden border border-[var(--border)]">
                <table className="min-w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--bg-primary)]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Project Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {projects.map((project) => (
                            <tr key={project.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{project.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">{project.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-[var(--text-secondary)]">{project.createdAt}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-red-500 hover:text-red-700 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
