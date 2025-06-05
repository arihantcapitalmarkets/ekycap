import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AutologinComponent } from './autologin/autologin.component';


const routes: Routes = [
    {
        path: 'bot-autologin',
        component: AutologinComponent,
        data: {
            title: 'Whats app Login'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BotAutologinRoutingModule { }