export type KeybindAction = 'left' | 'straight' | 'right' | 'newGame' | 'toggleAutoRestart';

type Keybinds = {
    [action in KeybindAction]: string;
};

let keybinds: Keybinds = {
    left: 'ArrowLeft',
    straight: 'ArrowUp',
    right: 'ArrowRight',
    newGame: 'n',
    toggleAutoRestart: 'a',
};

// Get the current keybind for an action
export const getKeybind = (action: KeybindAction): string => keybinds[action];

// Update the keybind for an action
export const setKeybind = (action: KeybindAction, key: string): void => {
    keybinds = { ...keybinds, [action]: key };
};

// Get all keybinds
export const getAllKeybinds = (): Keybinds => keybinds;