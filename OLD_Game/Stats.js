class Stats {
    constructor(type, Max_Health, Movement_Speed, Bullet_Damage, Body_Damage, Bullet_Frequency, Health_Regen, Bullet_Speed) {
        if(type === "enemy") {
            this.Max_Health = 0.5 + lv / 5;
            this.Movement_Speed = 0.5 + lv * 1;
            this.Bullet_Damage = 0.5 + lv * 1;
            this.Body_Damage = 0.5 + lv * 1;
            this.Bullet_Frequency = 180 - lv * 1;
            this.Health_Regen = 0.5 + lv * 1; // 沒有此功能
            this.Bullet_Speed = 0.5 + lv * 1;
        }
        else if (type === "boss") {
            this.Max_Health = 1.5 + lv / 5;
            this.Movement_Speed = 0.5 + lv * 1;
            this.Bullet_Damage = 0.5 + lv * 1;
            this.Body_Damage = 0.5 + lv * 1;
            this.Bullet_Frequency = 180 - lv * 1.5;
            this.Health_Regen = 0.5 + lv * 1; // 沒有此功能
            this.Bullet_Speed = 0.5 + lv * 1;
        }
        else {
            this.Max_Health = 1.8 + Max_Health * 1.2;
            this.Movement_Speed = 6 + Movement_Speed * 1.5;
            this.Bullet_Damage = Bullet_Damage * 1;
            this.Body_Damage = 0.5 + Body_Damage * 0.5;
            this.Bullet_Frequency = 6 + Bullet_Frequency * 1.5;
            this.Health_Regen = Health_Regen * 0.01;
            this.Bullet_Speed = 8 + Bullet_Speed * 1.1;
        }
    }
}