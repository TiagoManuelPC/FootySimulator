import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MatchEvent {
    id?: string;
    timestamp?: string;
    eventTypeString: 'Pass' | 'Shot' | 'Goal' | 'Tackle' | 'Clearance' | 'Possession';
    team: string;
    playerId: string;
    x: number;
    y: number;
    isAttacking?: boolean;
    shotSpeed?: number;
    shotDistance?: number;
    shotOnTarget?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SignalrService {
    private hubConnection!: signalR.HubConnection;
    public event$ = new Subject<MatchEvent>();

    public startConnection(hubUrl = environment.apiUrl + 'matchHub') {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start()
            .then(() => {
                console.log('SignalR connected');
                this.hubConnection.on('ReceiveEvent', (data: any) => {
                    // normalize types
                    this.event$.next(data as MatchEvent);
                });
            })
            .catch(err => console.error('SignalR start error', err));
    }

    public stopConnection() {
        this.hubConnection?.stop();
    }
}
