import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Calendar, User, Maximize2 } from 'lucide-react';

// Placeholder 3D Model Component
function Model() {
    // In a real app, use the URL from props
    // const { scene } = useGLTF(url);
    // return <primitive object={scene} />;

    return (
        <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
}

const ProjectDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/projects/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data);
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            }
        };
        fetchProject();
    }, [id]);

    if (!project) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Image */}
            <div className="h-[50vh] w-full overflow-hidden relative">
                <img
                    src={project.mainImageUrl || project.thumbnailUrl || ''} // Fallback
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 max-w-7xl mx-auto w-full">
                    <h1 className="text-4xl md:text-6xl font-bold mb-2">{project.title}</h1>
                    <p className="text-xl text-[var(--text-secondary)]">{project.location}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 border-b border-[var(--border)] pb-2">About the Project</h2>
                            <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
                                {project.description}
                            </p>
                        </section>

                        {/* Image Gallery */}
                        {project.images && project.images.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Gallery</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.images.map((img: string, idx: number) => (
                                        <div key={idx} className="aspect-video overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3D Viewer */}
                        <section className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)] h-[400px] relative">
                            <div className="absolute top-4 left-4 z-10 bg-[var(--bg-primary)] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                INTERACTIVE 3D VIEW
                            </div>
                            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                                <Stage environment="city" intensity={0.6}>
                                    <Model />
                                </Stage>
                                <OrbitControls autoRotate />
                            </Canvas>
                        </section>

                        {/* Simulation Video */}
                        {project.youtubeUrl && (
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Simulation Video</h2>
                                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={getEmbedUrl(project.youtubeUrl)}
                                        title="Project Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Specs */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--border)] sticky top-24">
                            <h3 className="text-lg font-bold mb-6 uppercase tracking-wider">Project Data</h3>

                            <div className="space-y-6 font-mono text-sm">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <span className="flex items-center text-[var(--text-secondary)]">
                                        <User size={16} className="mr-2" /> Architect
                                    </span>
                                    <span className="font-semibold">{project.architectName}</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <span className="flex items-center text-[var(--text-secondary)]">
                                        <Maximize2 size={16} className="mr-2" /> Area
                                    </span>
                                    <span className="font-semibold">{project.areaSqFt} sq.ft</span>
                                </div>

                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                                    <span className="flex items-center text-[var(--text-secondary)]">
                                        <Calendar size={16} className="mr-2" /> Year
                                    </span>
                                    <span className="font-semibold">{new Date(project.createdAt).getFullYear()}</span>
                                </div>

                                <div className="pt-4">
                                    <button className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold rounded hover:opacity-90 transition-opacity">
                                        Download Blueprint
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
