"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

function AdminHeader() {
    const { data: session } = useSession();

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <div className="bg-white border-b px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                        {session?.user?.role === "ADMIN" ? "Admin Dashboard" : "Staff Dashboard"}
                    </h2>
                    {session?.user?.role && (
                        <Badge className={
                            session.user.role === 'ADMIN' 
                                ? "bg-red-500 text-white" 
                                : "bg-blue-500 text-white"
                        }>
                            {session.user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium">{session?.user?.name || session?.user?.email}</span>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSignOut}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AdminHeader;