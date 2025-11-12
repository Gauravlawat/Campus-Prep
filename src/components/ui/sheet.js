import * as React from 'react';
import { cn } from '@/lib/utils';

const SheetContext = React.createContext({ open: false, setOpen: () => {} });

function Sheet({ open, onOpenChange, children }) {
  const value = React.useMemo(() => ({ open, setOpen: onOpenChange }), [open, onOpenChange]);
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

function SheetTrigger({ asChild, children, ...props }) {
  const { open, setOpen } = React.useContext(SheetContext);
  const Comp = asChild ? React.Fragment : 'button';
  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        onClick: (e) => {
          children.props.onClick?.(e);
          setOpen?.(!open);
        },
        ...props,
      })
    : null;
  return asChild ? child : <Comp onClick={() => setOpen?.(!open)} {...props}>{children}</Comp>;
}

function SheetContent({ side = 'right', className, children }) {
  const { open, setOpen } = React.useContext(SheetContext);
  return (
    <>
      {/* overlay */}
      <div
        onClick={() => setOpen?.(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />
      {/* panel */}
      <div
        className={cn(
          'fixed z-50 h-full w-[280px] sm:w-[320px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl transition-transform',
          side === 'right' ? 'right-0 top-0 translate-x-0' : 'left-0 top-0 -translate-x-full',
          open ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

export { Sheet, SheetContent, SheetTrigger };
