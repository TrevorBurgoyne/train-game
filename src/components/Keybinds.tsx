import { FC, useState } from 'react';
import { setKeybind, getAllKeybinds, KeybindAction } from '../utils/keybind_utils';
import '../styles/Keybinds.css';

const Keybinds: FC = () => {
    const [editingKeybind, setEditingKeybind] = useState<KeybindAction | null>(null);

    const handleKeybindChange = (action: KeybindAction, event: React.KeyboardEvent<HTMLInputElement>) => {
        setKeybind(action, event.key);
        setEditingKeybind(null);
    };

    return (
        <div className="keybinds">
            <h3>Configure Keybinds</h3>
            {Object.entries(getAllKeybinds()).map(([action, key]) => (
                <div key={action} className="keybind-item">
                    <span>{action}: </span>
                    {editingKeybind === action ? (
                        <input
                            type="text"
                            value={key}
                            onKeyDown={(e) => handleKeybindChange(action as KeybindAction, e)}
                            onBlur={() => setEditingKeybind(null)}
                            autoFocus
                        />
                    ) : (
                        <button onClick={() => setEditingKeybind(action as KeybindAction)}>
                            {key}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Keybinds;