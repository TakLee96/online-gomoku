package gomoku;

import javax.swing.JApplet;
import javax.swing.JButton;
import javax.swing.ImageIcon;
import javax.swing.BorderFactory;
import javax.swing.border.Border;
import javax.swing.SwingUtilities;

import java.awt.Container;
import java.awt.Component;
import java.awt.Graphics;
import java.awt.Color;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import java.net.URL;

public class Main extends JApplet {
    private static final int L = 50;
    private static final int N = State.N;
    private static final int S = L * N;
    private static Border redBorder = BorderFactory.createLineBorder(Color.red);
    private static Border yellowBorder = BorderFactory.createLineBorder(Color.yellow);

    private ImageIcon blue   = null,
                      empty  = null,
                      green  = null,
                      red    = null,
                      yellow = null;
    private JButton[][] ref;
    private State state;
    private MinimaxAgent agent;
    private boolean humanClicked = false;
    private class Listener implements ActionListener {
        private int i, j;
        public Listener(int x, int y) { i = x; j = y; }
        @Override
        public void actionPerformed(ActionEvent e) {
            if (!state.ended() && state.canMove(j, i)) {
                humanClicked = true;
                if (state.started()) {
                    Action a = state.lastAction();
                    ref[a.y()][a.x()].setBorderPainted(false);
                }
                state.move(j, i);
                if (state.get(j, i).isBlack())
                    ref[i][j].setIcon(blue);
                else ref[i][j].setIcon(green);
                ref[i][j].setBorder(redBorder);
                ref[i][j].setBorderPainted(true);
                if (state.ended()) {
                    for (Action a : state.five) {
                        ref[a.y()][a.x()].setBorder(yellowBorder);
                        ref[a.y()][a.x()].setBorderPainted(true);
                    }
                } else if (state.isBlacksTurn()) {
                    SwingUtilities.invokeLater(new Runnable() {
                        @Override
                        public void run() {
                            Action a = agent.getAction(state);
                            ref[a.y()][a.x()].doClick();
                        }
                    });
                }
            }
        }
    }

    @Override
    public void init() {
        String base = this.getDocumentBase().toString();
        if (base.charAt(base.length()-1) != '/') base += "/";
        base += "gomoku/img/";
        try {
            blue   = new ImageIcon(this.getImage(new URL(base+"grid-blue.jpg")));
            empty  = new ImageIcon(this.getImage(new URL(base+"grid-empty.jpg")));
            green  = new ImageIcon(this.getImage(new URL(base+"grid-green.jpg")));
            red    = new ImageIcon(this.getImage(new URL(base+"grid-red.jpg")));
            yellow = new ImageIcon(this.getImage(new URL(base+"grid-yellow.jpg")));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        ref = new JButton[N][N];
        state = new State(ref, red, yellow, empty);
        agent = new MinimaxAgent(true);

        Container content = super.getContentPane();
        content.setBackground(Color.white);

        JButton grid = null;
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                grid = new JButton(empty);
                grid.setLocation(j * L, i * L);
                grid.setSize(L, L);
                grid.addActionListener(new Listener(i, j));
                ref[i][j] = grid;
                content.add(grid);
            }
        }

        // trigger UI update
        grid = new JButton();
        content.add(grid);

        // first move
        Action a = agent.getAction(state);
        ref[a.y()][a.x()].doClick();
    }
}
