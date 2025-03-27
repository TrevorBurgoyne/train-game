import React, { useState } from 'react';
import { getAllKeybinds, setKeybind } from '../utils/keybind_utils';
import '../styles/Keybinds.css';

type KeybindsProps = {
    onEditingKeybind: (isEditing: boolean) => void; // Callback to notify parent
};

const Keybinds: React.FC<KeybindsProps> = ({ onEditingKeybind }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingKeybind, setEditingKeybind] = useState<string | null>(null);

    const handleKeybindChange = (action: string, event: React.KeyboardEvent<HTMLInputElement>) => {
        setKeybind(action as any, event.key); // Update the keybind
        setEditingKeybind(null); // Exit editing mode
        onEditingKeybind(false); // Notify parent that editing has stopped
    };

    const startEditingKeybind = (action: string) => {
        setEditingKeybind(action);
        onEditingKeybind(true); // Notify parent that editing has started
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
                                    onBlur={() => {
                                        setEditingKeybind(null);
                                        onEditingKeybind(false); // Notify parent that editing has stopped
                                    }}
                                />
                            ) : (
                                <button onClick={() => startEditingKeybind(action)}>{key}</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Keybinds;