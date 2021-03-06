Vue.component('item',{
    props:["full_name","person_number"],
    template:`
        <div class="item">
            <img src="./garage/person.svg">
            <h1>{{full_name}}</h1>
            <button class="showPersonPages" v-on:click="showPersonPages">مشاهده سهم</button>
        </div>
    `,
    methods:{
        showPersonPages:function(){
            console.log(this.person_number)
            let alertMessage = `
                سهم این فرد به شرح زیر است:
                صفحه ${(this.person_number*5)-4}
                صفحه ${(this.person_number*5)-3}
                صفحه ${(this.person_number*5)-2}
                صفحه ${(this.person_number*5)-1}
                صفحه ${(this.person_number*5)}
                
                
            `
            alert(alertMessage)
        }
    }
})

const app = new Vue({
    el:"#Vue_container",
    data:{
        people_object: []
        //objects must be like this :
        //{full_name:"hamed",person_number:22}
    }
});