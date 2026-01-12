import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import CreatePostForm from '../components/posts/CreatePostForm';
import PostList from '../components/posts/PostList';
import SectionFilter from '../components/posts/SectionFilter';
import { sectionService } from '../services/sectionService';

const HomePage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await sectionService.getSections(0, 20);
        setSections(data.content || []);
      } catch (error) {
        console.error('Error cargando secciones:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <CreatePostForm />
        <SectionFilter
          sections={sections}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          loading={loading}
        />
        <PostList sectionType={selectedSection} />
      </main>
    </div>
  );
};

export default HomePage;