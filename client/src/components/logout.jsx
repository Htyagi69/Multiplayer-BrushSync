import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react'; // Assuming you use lucide-react for icons
import { authClient } from '../lib/auth-client';
import { toast } from 'sonner';

export const UserProfile = ({ user}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const onLogout=async()=>{
      await authClient.signOut({
        fetchOptions:{
            onSuccess:()=>{
                toast.success("Logout Successfully")
            },
            onError:()=>{
                toast.error("Something went wrong")
            }
        }
      })
  }
  return (
    <div className="relative">
      {/* Trigger: The Profile Section */}
      <div 
        className="text-black mt-2 flex items-center gap-2 cursor-pointer hover:opacity-80" 
        onClick={toggleDropdown}
      >
        {user.image ? (
          <img src={user.image} alt="avatar" className="rounded-full w-8 h-8 object-cover" />
        ) : (
          <User color="black" size={24} />
        )}
        <span className="font-medium">{user.name}</span>
      </div>

      {/* The Logout Box (Dropdown) */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <ul className="py-1">
            <li 
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <LogOut size={16} />
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};