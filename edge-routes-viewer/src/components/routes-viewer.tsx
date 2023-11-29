import styled from 'styled-components';
import * as d3 from 'd3';
import { useEffect } from 'react';
import { IDeviceTemplate, ILink, IModule } from './interfaces';
import {
  getLinkedNodes,
  getLinks,
  processDeviceTemplate,
} from './deviceTemplate';

/* eslint-disable-next-line */
export interface RoutesViewerProps {
  height: number;
  width: number;
  deviceTemplate: IDeviceTemplate | undefined;
}

const StyledRoutesViewer = styled.div`
  color: pink;
`;

export function RoutesViewer(props: RoutesViewerProps) {
  const { deviceTemplate, width } = props;

  const radius = { min: 20, max: 50 };
  const margin = radius.max * 2 + 20;
  let ref!: SVGSVGElement;

  useEffect(() => {
    // remove children
    d3.select(ref).selectAll('*').remove();
    if (!deviceTemplate) return;

    const [modules, routes] = processDeviceTemplate(deviceTemplate);
    const links = getLinks(modules, routes);

    // remove children
    d3.select(ref).selectAll('*').remove();

    let height = props.height;
    if(modules.length * radius.max * 2 + margin * 2 > props.height)
      height = modules.length * radius.max * 2;
    // create arcs
    const arc = (d: ILink) => {
      const y1 = y(d?.source?.name ?? '')!,
        y2 = y(d?.target?.name ?? '')!;
      const r = Math.abs(y2 - y1) / 2;
      return `M${margin + radius.max / 2} ${y1} A ${r},${r} 0 0,${
        y1 < y2 ? 1 : 0
      } ${margin + radius.max / 2},${y2}`;
    };
    // Create a point scale for the module names
    const y = d3
      .scalePoint()
      .domain(modules.map((d) => d.name))
      .range([radius.max * 2, height - radius.max * 2]);

    // Create an ordinal scale for the module names
    const color = d3
      .scaleOrdinal()
      .domain(modules.map((d) => d.name))
      // The range of the scale is a set of predefined colors
      .range([
        '#4e79a7',
        '#f28e2c',
        '#e15759',
        '#76b7b2',
        '#59a14f',
        '#edc949',
        '#af7aa1',
        '#ff9da7',
        '#9c755f',
        '#bab0ab',
      ]);

    // append the svg object to the body of the page
    const svg = d3
      .select(ref)
      .attr('font-size', '10pt')
      .attr('viewBox', [0, 0, width, height]);

    const arcs = svg
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('id', (d, i) => `path-${i}`)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 5)
      .attr('stroke-dashoffset', '3')
      .attr('stroke-dasharray', (d) =>
        d?.source?.kind === 'MISSING' || d?.target?.kind === 'MISSING'
          ? '3 3'
          : '0'
      )
      .attr('d', arc)
      .call((g) =>
        g
          .append('title')
          .text(
            (d) =>
              `${
                d?.target?.kind === 'MISSING' ? '*** invalid route ***\n' : ''
              }${d.route.name}\n${d.source?.name} [${d.outTopic}] - ${
                d.target?.name
              } ${d.inTopic ? `[${d.inTopic}]` : ''}`
          )
          .attr('font-family', 'Arial')
          .attr('class', "code")
      )
      .on('mouseover', highlight)
      .on('mouseout', restore);

    // animated message
    const msgs = svg
      .selectAll('circle')
      .data(links)
      .join('circle')
      .attr('r', '5')
      .attr('fill', '#ccc'); //"d=> color(d.source.name));

    msgs
      .append('animateMotion')
      .attr('dur', '10s')
      .attr('repeatCount', 'indefinite')
      .append('mpath')
      .attr('xlink:href', (d, i) => `#path-${i}`);

    // modules
    const circles = svg
      .selectAll('.node')
      .data(modules)
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${margin}, ${y(d.name)})`)
      .on('mouseover', highlight)
      .on('mouseout', restore);

    circles
      .filter((d) => d.kind !== 'EMPTY')
      .append('circle')
      .attr('r', (d) => '20')
      .attr('stroke', (d): string => color(d.name) as string)
      .attr('stroke-width', 3)
      .attr('fill', (d) => (d.kind === 'MISSING' ? '#ccc' : 'transparent'));

    // IOTHUB
    circles
      .filter((d) => d.kind === 'IOTHUB')
      .append('use')
      .attr('xlink:href', '#iothub')
      .attr('x', '-10')
      .attr('y', '-10')
      .attr('width', '20')
      .attr('height', '20');

    circles
      .filter((d) => d.kind !== 'EMPTY')
      .append('g')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(0,${radius.min + 15})`)
      .call((g) =>
        g
          .append('text')
          .text((d) => d.name)
          .attr('class', (d) => (d.kind === 'MISSING' ? 'label-missing' : 'label'))
      );

    function highlight(
      e: unknown,
      d: IModule | ILink,
      restore: boolean = false
    ) {
      // check type
      if ('name' in d) {
        arcs
          .filter((a) => a?.source === d || a?.target === d)
          .transition()
          .duration(500)
          .attr('stroke', (d): string =>
            restore ? '#ccc' : (color(d?.source?.name ?? '') as string)
          );

        msgs
          .filter((a) => a.source === d || a.target === d)
          .transition()
          .duration(500)
          .attr('fill', (d): string =>
            restore ? '#ccc' : (color(d?.source?.name ?? '') as string)
          );

        circles
          .select('circle')
          .transition()
          .duration(500)
          .attr('stroke', (c): string =>
            restore ||
            getLinkedNodes(links, d.name).some((n) => n === c) ||
            d === c
              ? (color(c?.name ?? '') as string)
              : '#ccc'
          );
      } else if ('source' in d) {
        arcs
          .transition()
          .duration(500)
          .attr('stroke', (a): string =>
            restore || a !== d
              ? '#ccc'
              : (color(a?.source?.name ?? '') as string)
          );

        msgs
          .transition()
          .duration(500)
          .attr('fill', (a): string =>
            restore || a !== d
              ? '#ccc'
              : (color(a?.source?.name ?? '') as string)
          );

        circles
          .select('circle')
          .transition()
          .duration(500)
          .attr('stroke', (c): string =>
            restore || c === d.source || c === d.target
              ? (color(c.name ?? '') as string)
              : '#ccc'
          );
      }
    }

    // Function to restore the original color of the circles
    function restore(e: unknown, d: IModule | ILink) {
      highlight(e, d, true);
    }
  }, [deviceTemplate]);

  return (
    <StyledRoutesViewer>
      <svg
        width={props.width}
        height={props.height}
        id="barchart"
        ref={(r: SVGSVGElement) => (ref = r)}
      />
    </StyledRoutesViewer>
  );
}

export default RoutesViewer;
