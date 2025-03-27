import React, { useState } from 'react';
import { getAllKeybinds, setKeybind } from '../utils/keybind_utils';
import '../styles/Keybinds.css';

const Keybinds: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false); // Track whether the menu is expanded
    const [editingKeybind, setEditingKeybind] = useState<string | null>(null);

    const handleKeybindChange = (action: string, event: React.KeyboardEvent<HTMLInputElement>) => {
        setKeybind(action as any, event.key); // Update the keybind
        setEditingKeybind(null); // Exit editing mode
    };

    return (
        <div className={`keybinds-container ${isExpanded ? 'expanded' : 'minimized'}`}>
            <div className="keybinds-header" onClick={() => setIsExpanded(!isExpanded)}>
                <span>Keybinds</span>
                <span className={`arrow ${isExpanded ? 'up' : 'down'}`}>▼</span>
            </div>
            {isExpanded && (
                <div className="keybinds-list">
                    {Object.entries(getAllKeybinds()).map(([action, key]) => (
                        <div key={action} className="keybind-item">
                            <span>{action}: </span>
                            {editingKeybind === action ? (
                                <input
                                    type="text"
                                    value={key}
                                    readOnly
                                    onKeyDown={(e) => handleKeybindChange(action, e)}
                                    onBlur={() => setEditingKeybind(null)}
                                />
                            ) : (
                                <button onClick={() => setEditingKeybind(action)}>{key}</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Keybinds;