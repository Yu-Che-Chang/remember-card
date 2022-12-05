//  定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

//  花色
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const view = {
  getCardContent(index) {
    const number = this.transformNumbers((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>`
  },

  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`
  },

  transformNumbers(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  //  filpcard => filpcards
  //  不確定cards會傳來幾個值
  //  利用... 其餘參數 rest parameters ，搭配 map 來迭代
  filpCards(...cards) {
    cards.map(card => {
      //  如果是背面
      //  回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      //  如果是正面
      //  回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        card.classList.remove('wrong')
      },
        {
          once: true
        }
      )
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
  <p>Completed !</p>
  <p>Score:${model.score} </p>
  <p>You've been tried: ${model.triedTimes} times.</p>
    `
    const header = document.querySelector('#header')
    //  childnode.before()  node插入在childnode前
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = {
  revealCards: [],

  isRevealCardsMatched() {
    return this.revealCards[0].dataset.index % 13 ===
      this.revealCards[1].dataset.index % 13
  },

  score: 250,

  triedTimes: 0,
}

//  依照狀態 控制遊戲
const controller = {
  //  目前狀態
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  //  依照不同遊戲狀態，做不同行為
  dispatchCardAction(card) {
    //  挑出非牌背的卡 執行動作
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      //  第一次翻牌
      //  revealCards 紀錄第一次牌
      //  Game_state 改變
      case GAME_STATE.FirstCardAwaits:
        view.filpCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break

      case GAME_STATE.SecondCardAwaits:
        //  嘗試次數
        view.renderTriedTimes(++model.triedTimes) 

        view.filpCards(card)
        model.revealCards.push(card)

        if (model.isRevealCardsMatched()) {
          //  配對正確
          //  清空 revealCard
          //  狀態: firstCardAwaits
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealCards)
          view.renderScore(model.score += 10)
          model.revealCards = []
          if (model.score === 260) {
            console.log('遊戲結束!')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //  配對錯誤
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }

    console.log('currrentState:', this.currentState)
    console.log('revealCard:', model.revealCards)
  },

  resetCards() {
    view.filpCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

controller.generateCards()

//  nodeList (array-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})