import { Component } from '@angular/core';
import { AlphaVantageApiService } from '../shared/services/alpha-vantage-api.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MarketStackApiService } from '../shared/services/market-stack-api.service';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.scss'
})
export class StocksComponent {
  formIsInvalid: boolean = false;
  isAdmin: boolean = true;
  ingredientList = [
    {name: 'noodles', quantity: 1},
    {name: 'miso broth', quantity: 1},
    {name: 'egg', quantity: 2},

  ]
  stocksForm: FormGroup;
  apiResponse: string = 'No response yet';

  constructor(
    private alphaVantageApiService: AlphaVantageApiService,
    private formBuilder: FormBuilder,
    private marketStackApiService: MarketStackApiService
  ) 
  {
    this.stocksForm = this.formBuilder.group({
      ticker: ['']
    })
  }


  foo = new Observable((subscriber) => {
    try {
      subscriber.next('Hello');
      subscriber.next(42);
      // setTimeout(() => {
      //   subscriber.next('hello');
      // }, 1000)
    }
    catch (err) {
      subscriber.error(err)
    }

  })

  bar = new Observable(function subscribe(subscriberrr) {
    subscriberrr.next('bar');
    // const id = setInterval(() => {
    //   subscriberrr.next('hi');
    // }, 5000);

  })

  action() {
    const foosubscription =  this.foo.subscribe((x) => {
      console.log(x)
    })
    const barsubscription = this.bar.subscribe((x) =>{
      console.log(x);
    })
    console.log(foosubscription);
    console.log(barsubscription);
    foosubscription.unsubscribe();
    barsubscription.unsubscribe();
    console.log(foosubscription);
    console.log(barsubscription);

    console.log(this.stocksForm.value.ticker)

    // const marketSubscription = this.marketStackApiService.getBasicEndOfDayDataObservable(this.stocksForm.value.ticker).subscribe((response) => {
    //   console.log(response);
    //   this.apiResponse = JSON.stringify(response);
    // })

    // const alphaSubscription = this.alphaVantageApiService.getTimeSeriesDailyObservable(this.stocksForm.value.ticker).subscribe((response) => {
    //   console.log(response);
    //   this.apiResponse = JSON.stringify(response);
    // }); 
    
  }

}
