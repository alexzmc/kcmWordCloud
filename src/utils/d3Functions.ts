import * as d3 from 'd3'

const darkBlue = '#24357a'
interface WordObj {
  text: string
  size: number
}
interface Word extends WordObj{
  font?: string
  style?: string
  weight?: string
  rotate?: number
  x?: number
  y?: number
}

interface CloudLayout {
  [key:string]:any
}

const  draw = (words: Word[]) => {
  const text = d3.select('g').selectAll<SVGSVGElement, Word>('text') // select all text
      .data(words, (d) => d.text)
  text.transition()
    .duration(500)
    .style('font-size', (d) => `${d.size}px`)
    .attr('font-family', 'Impact')
    .attr('transform', (d) => `translate(${d.x}, ${d.y})rotate(${d.rotate})`);
  text.enter()
    .append('text')
      .style('font-size', (d) => `${d.size}px`) 
      .style('font-family', 'Impact')
      .style('fill', 'white' )
      .attr('text-anchor', 'middle')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})rotate(${d.rotate})`)
      .text((d) => d.text)
  text.exit().transition()
    .duration(500)
    .remove()
}

export const renderWordCloud = (cloudLayout: CloudLayout , elementRef: HTMLDivElement | null, words: Word[]) => {
  d3.select(elementRef).append('svg')
    .attr('width', 800)
    .attr('height', 600)
    .style('background-color', darkBlue)
    .append('g')
    .attr('transform', `translate(${cloudLayout.size()[0] / 2}, ${cloudLayout.size()[1] / 2})`)
  cloudLayout
    .words(words)
    .padding(0)
    .rotate(() => Math.floor(Math.random() * 2) * 30)
    .fontSize((d: Word) => d.size)
    .on('end', draw) // call drawfn every time stops
    .start()
}

export const updateWordCloud = (cloudLayout: CloudLayout, words: Word[]) => {
  cloudLayout
    .stop()
    .words(words.map(d => {
      return { text : d.text, size : d.size }  
    }))
    .start()
	}
