import React, { useState } from 'react';
import { ChannelList } from '../components/ChannelList';
import { NewChannelForm } from '../components/NewChannelForm';
import { MessageArea } from '../components/MessageArea';
import { MemberList } from '../components/MemberList';

export function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState(null); // State to hold the selected channel

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Server List Column */}
      <div className="w-16 bg-gray-800 text-white flex flex-col items-center py-3 space-y-2">
        {/* Server icons will go here */}
        <p>Servers</p>
      </div>

      {/* Channel List Column */}
      <div className="w-64 bg-gray-700 text-white flex flex-col">
        <div className="p-3 border-b border-gray-600">
          {/* Channel list header/server name */}
          <h2 className="text-lg font-bold">AlpacaDN</h2>
        </div>
        <div className="flex-grow overflow-y-auto p-3 space-y-2">
          <ChannelList onSelectChannel={setSelectedChannel} selectedChannelId={selectedChannel?.id} />
        </div>
        <div className="mt-auto p-3 border-t border-gray-600">
           <NewChannelForm />
        </div>
         {/* User section will go here */}
         <div className="p-3 bg-gray-900 text-sm">
           <p>User Info</p>
         </div>
      </div>

      {/* Message Area Column */}
      <div className="flex-grow bg-gray-600 flex flex-col">
        <MessageArea selectedChannel={selectedChannel} />
      </div>

      {/* Member List Column */}
      <div className="w-56 bg-gray-700 text-white flex flex-col">
         <div className="p-3 border-b border-gray-600">
           {/* Member list header */}
           <h2 className="text-lg font-bold">Members</h2>
         </div>
         <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {/* Member list will go here */}
            <MemberList selectedChannel={selectedChannel} />
         </div>
      </div>
    </div>
  );
} 