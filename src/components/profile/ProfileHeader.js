import React from 'react';
import { Edit } from 'lucide-react';

const ProfileHeader = ({ profile, isOwnProfile }) => {
  return (
    <div className="flex items-center space-x-6">
      <img src={profile?.basicInfo?.avatar || 'https://via.placeholder.com/150'} alt={profile?.basicInfo?.firstName} className="w-24 h-24 rounded-full" />
      <div>
        <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">{profile?.basicInfo?.firstName} {profile?.basicInfo?.lastName}</h1>
            {isOwnProfile && (
                <button className="text-gray-500 hover:text-gray-700">
                    <Edit size={20} />
                </button>
            )}
        </div>
        <p className="text-gray-600">{profile?.basicInfo?.bio}</p>
        <div className="flex space-x-4 mt-2 text-sm text-gray-600">
          <a href={profile?.socialLinks?.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
          <a href={profile?.socialLinks?.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          <a href={profile?.socialLinks?.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Portfolio</a>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
