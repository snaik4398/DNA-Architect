import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    location: string;
    thumbnail: string; // Base64 string
}

const Home: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Use relative path since we'll proxy in vite.config or assume same host if built
                // For dev, we need to point to the server port
                const response = await fetch('http://localhost:3001/api/projects');
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                // Map backend data to frontend interface
                const mappedProjects = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    location: p.location,
                    thumbnail: p.thumbnail || p.thumbnailUrl || '', // Handle different possible field names
                }));
                setProjects(mappedProjects);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[var(--bg-secondary)]">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        SHAPING THE <span className="text-[var(--accent)]">FUTURE</span>
                    </h1>
                    <p className="text-xl md:text-2xl max-w-2xl mx-auto text-[var(--text-secondary)] mb-10">
                        Visionary architecture merging digital precision with organic forms.
                    </p>
                    <a href="#portfolio" className="inline-flex items-center px-8 py-3 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] transition-all rounded-full font-medium">
                        View Projects <ArrowRight className="ml-2" size={20} />
                    </a>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Selected Works</h2>
                        <div className="h-1 w-20 bg-[var(--accent)]"></div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/3] bg-[var(--bg-secondary)] animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <Link to={`/project/${project.id}`} key={project.id} className="group relative block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                                <div className="aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
                                    <img
                                        src={project.thumbnail.startsWith('data:') ? project.thumbnail : `http://localhost:3001${project.thumbnail}`}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <h3 className="text-white text-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{project.title}</h3>
                                    <div className="flex items-center text-gray-300 mt-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        <MapPin size={16} className="mr-1" />
                                        <span className="text-sm">{project.location}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
