'use client';
import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
// Consultation management links are private. Avoid passing their location to trackers.
export default function TelemetryBoundary({children}:{children:ReactNode}){return usePathname()==='/talk-to-asad'?null:children;}
